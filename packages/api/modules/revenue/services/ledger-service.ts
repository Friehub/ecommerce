import { prisma, Decimal, LedgerEntryType, LedgerStatus } from '@ecom/db'

export const ledgerService = {
  async recordSale(orderLineId: string) {
    const line = await prisma.orderLine.findUnique({
      where: { id: orderLineId },
      include: { 
        variant: { include: { product: { include: { category: true } } } },
        package: { select: { sellerId: true } }
      }
    });

    if (!line) throw new Error('ORDER_LINE_NOT_FOUND');

    const sellerId = line.package.sellerId;
    const grossAmount = line.unitPrice.mul(line.quantity);
    const commissionRate = line.variant.product.category.commissionRate || new Decimal(10); // Default 10%
    const commissionAmount = grossAmount.mul(commissionRate).div(100);

    return await prisma.$transaction(async (tx) => {
      // 1. Record Gross Sale (PENDING)
      const saleEntry = await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          orderLineId,
          type: LedgerEntryType.SALE,
          amount: grossAmount,
          status: LedgerStatus.PENDING
        }
      });

      // 2. Record Platform Commission (PENDING)
      const commissionEntry = await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          orderLineId,
          type: LedgerEntryType.COMMISSION,
          amount: commissionAmount.negated(),
          status: LedgerStatus.PENDING
        }
      });

      return { saleEntry, commissionEntry };
    });
  },

  async recordBulkSale(orderLineIds: string[]) {
    const lines = await prisma.orderLine.findMany({
      where: { id: { in: orderLineIds } },
      include: { 
        variant: { include: { product: { include: { category: true } } } },
        package: { select: { sellerId: true } }
      }
    });

    const data = lines.flatMap(line => {
      const sellerId = line.package.sellerId;
      const grossAmount = line.unitPrice.mul(line.quantity);
      const commissionRate = line.variant.product.category.commissionRate || new Decimal(10);
      const commissionAmount = grossAmount.mul(commissionRate).div(100);

      return [
        {
          sellerId,
          orderLineId: line.id,
          type: LedgerEntryType.SALE,
          amount: grossAmount,
          status: LedgerStatus.PENDING
        },
        {
          sellerId,
          orderLineId: line.id,
          type: LedgerEntryType.COMMISSION,
          amount: commissionAmount.negated(),
          status: LedgerStatus.PENDING
        }
      ];
    });

    return prisma.sellerLedgerEntry.createMany({ data });
  },

  async scheduleEscrowRelease(orderId: string) {
    const lines = await prisma.orderLine.findMany({
      where: { package: { orderId } }
    });

    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 7); // 7 day return window

    await prisma.sellerLedgerEntry.updateMany({
      where: { 
        orderLineId: { in: lines.map(l => l.id) },
        status: LedgerStatus.PENDING
      },
      data: {
        availableAt: releaseDate
      }
    });
  },

  async getSellerBalance(sellerId: string, status?: LedgerStatus, client = prisma) {
    const aggregation = await (client as any).sellerLedgerEntry.aggregate({
      where: { 
        sellerId,
        ...(status ? { status } : {})
      },
      _sum: {
        amount: true
      }
    });

    return (aggregation._sum.amount as unknown as Decimal) || new Decimal(0);
  },

  async releaseMatureEscrow() {
    const now = new Date();
    
    // Find all entries that are PENDING and mature
    const matureEntries = await prisma.sellerLedgerEntry.findMany({
      where: {
        status: LedgerStatus.PENDING,
        availableAt: { lte: now },
        orderLineId: { not: null }
      },
      select: { id: true, orderLineId: true }
    });

    if (matureEntries.length === 0) return { count: 0 };

    const orderLineIds = matureEntries
      .map(e => e.orderLineId)
      .filter((id): id is string => id !== null);
    
    // Find order lines that have an active dispute
    const activeDisputes = await prisma.dispute.findMany({
      where: {
        orderLineId: { in: orderLineIds },
        status: { in: ['OPEN', 'UNDER_REVIEW'] }
      },
      select: { orderLineId: true }
    });

    const disputedOrderLineIds = new Set(activeDisputes.map(d => d.orderLineId));

    const eligibleEntryIds = matureEntries
      .filter(e => !disputedOrderLineIds.has(e.orderLineId))
      .map(e => e.id);

    if (eligibleEntryIds.length === 0) return { count: 0 };

    return await prisma.sellerLedgerEntry.updateMany({
      where: {
        id: { in: eligibleEntryIds }
      },
      data: {
        status: LedgerStatus.AVAILABLE
      }
    });
  },

  async withdrawFunds(sellerId: string, amount: Decimal | number, statementId?: string | null) {
    const { lockManager } = await import('../../../shared/services/managers/lock-manager');
    const decimalAmount = new Decimal(amount);
    
    return await lockManager.withLock(`withdraw:${sellerId}`, async () => {
      return await prisma.$transaction(async (tx) => {
        // 1. Check available balance
        const availableBalance = await this.getSellerBalance(sellerId, LedgerStatus.AVAILABLE, tx as any);
        
        if (availableBalance.lessThan(decimalAmount)) {
          throw new Error('INSUFFICIENT_FUNDS');
        }

        const payout = await tx.payout.create({
          data: {
            sellerId,
            statementId: statementId || null,
            amount: decimalAmount,
            status: 'PENDING'
          }
        });

        const ledgerEntry = await tx.sellerLedgerEntry.create({
          data: {
            sellerId,
            type: LedgerEntryType.WITHDRAWAL,
            amount: decimalAmount.negated(),
            status: LedgerStatus.AVAILABLE
          }
        });

        return { payout, ledgerEntry };
      });
    });
  },

  async recordPenalty(sellerId: string, amount: number, reason: string) {
    return await prisma.sellerLedgerEntry.create({
      data: {
        sellerId,
        type: LedgerEntryType.PENALTY,
        amount: new Decimal(amount).negated(),
        status: LedgerStatus.AVAILABLE
      }
    });
  },

  async generateStatement(sellerId: string, periodStart: Date, periodEnd: Date) {
    const existing = await prisma.sellerStatement.findFirst({
      where: { sellerId, periodStart, periodEnd }
    });

    if (existing) return existing;

    const aggregates = await prisma.sellerLedgerEntry.groupBy({
      by: ['type'],
      where: {
        sellerId,
        createdAt: { gte: periodStart, lte: periodEnd }
      },
      _sum: { amount: true }
    });

    const getSum = (type: LedgerEntryType) => 
      aggregates.find(a => a.type === type)?._sum.amount || new Decimal(0);

    const gross = getSum(LedgerEntryType.SALE);
    const commission = getSum(LedgerEntryType.COMMISSION);
    const adSpend = getSum(LedgerEntryType.AD_SPEND);
    const penalties = getSum(LedgerEntryType.PENALTY);
    const net = aggregates.reduce((acc, a) => acc.add(a._sum.amount || 0), new Decimal(0));

    return await prisma.sellerStatement.create({
      data: {
        sellerId,
        periodStart,
        periodEnd,
        gross,
        commission,
        adSpend,
        penalties,
        net,
        status: 'OPEN'
      }
    });
  }
};
