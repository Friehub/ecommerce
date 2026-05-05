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
    const aggregation = await client.sellerLedgerEntry.aggregate({
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
    
    // B05: Use atomic updateMany with inline dispute filtering
    const result = await prisma.sellerLedgerEntry.updateMany({
      where: {
        status: LedgerStatus.PENDING,
        availableAt: { lte: now },
        orderLine: { 
          package: { orderId: { not: undefined } },
          disputes: { 
            none: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } 
          }
        }
      },
      data: {
        status: LedgerStatus.AVAILABLE
      }
    });

    return { count: result.count };
  },

  async releaseEscrowByOrder(orderId: string) {
    const now = new Date();
    
    // B05: Atomic update for specific order
    const result = await prisma.sellerLedgerEntry.updateMany({
      where: {
        orderLine: { 
          package: { orderId },
          disputes: { 
            none: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } 
          }
        }
      },
      data: {
        status: LedgerStatus.AVAILABLE
      }
    });

    return { count: result.count };
  },

  async withdrawFunds(sellerId: string, amount: Decimal | number, statementId?: string | null) {
    const decimalAmount = new Decimal(amount);
    
    return await prisma.$transaction(async (tx) => {
      // B06: Debit first, then verify (prevents TOCTOU)
      
      // 1. Create Ledger Entry for the withdrawal (Debit)
      await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          type: LedgerEntryType.WITHDRAWAL,
          amount: decimalAmount.negated(),
          status: LedgerStatus.AVAILABLE 
        }
      });

      // 2. Recompute balance — if now negative, roll back
      const availableBalance = await this.getSellerBalance(sellerId, LedgerStatus.AVAILABLE, tx as any);
      
      if (availableBalance.lessThan(0)) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 3. Create Payout record
      const payout = await tx.payout.create({
        data: {
          sellerId,
          statementId: statementId || null,
          amount: decimalAmount,
          status: 'PENDING'
        }
      });

      return { payout };
    });
  },

  async recordPenalty(sellerId: string, amount: number, reason: string) {
    return await prisma.sellerLedgerEntry.create({
      data: {
        sellerId,
        type: LedgerEntryType.PENALTY,
        amount: new Decimal(amount).negated(),
        status: LedgerStatus.AVAILABLE // Penalties usually hit the available balance immediately
      }
    });
  },

  async generateStatement(sellerId: string, periodStart: Date, periodEnd: Date) {
    const existing = await prisma.sellerStatement.findFirst({
      where: {
        sellerId,
        periodStart,
        periodEnd
      }
    });

    if (existing) {
      console.log(`Statement already exists for seller ${sellerId} from ${periodStart} to ${periodEnd}. Returning existing statement.`);
      return existing;
    }

    const entries = await prisma.sellerLedgerEntry.findMany({
      where: {
        sellerId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    });

    const gross = entries
      .filter(e => e.type === LedgerEntryType.SALE)
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const commission = entries
      .filter(e => e.type === LedgerEntryType.COMMISSION)
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const adSpend = entries
      .filter(e => e.type === LedgerEntryType.AD_SPEND)
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const penalties = entries
      .filter(e => e.type === LedgerEntryType.PENALTY)
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const net = entries.reduce((acc, e) => acc.add(e.amount), new Decimal(0));

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
