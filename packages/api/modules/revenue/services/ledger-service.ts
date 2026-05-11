import { prisma, Decimal, LedgerEntryType, LedgerStatus } from '@ecom/db'
import type { Service } from '../../../types.js'
import { currencyService } from './currency-service.js';
import { reportingService } from './reporting-service.js';

export const ledgerService: Service = {
  ...reportingService,

  async recordSale(orderLineId: string): Promise<any> {
    const line = await prisma.orderLine.findUnique({
      where: { id: orderLineId },
      include: { 
        variant: { include: { product: { include: { category: true } } } },
        package: { select: { sellerId: true } }
      }
    });

    if (!line) throw new Error('ORDER_LINE_NOT_FOUND');

    // Idempotency: Check if sale already recorded
    const existing = await prisma.sellerLedgerEntry.findFirst({
      where: { orderLineId, type: LedgerEntryType.SALE }
    });
    if (existing) return { saleEntry: existing };

    const sellerId = line.package.sellerId;
    const grossAmount = line.unitPrice.mul(line.quantity);
    const commissionRate = line.variant.product.category.commissionRate || new Decimal(10);
    const commissionAmount = grossAmount.mul(commissionRate).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return await prisma.$transaction(async (tx) => {
      const saleEntry = await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          orderLineId,
          type: LedgerEntryType.SALE,
          amount: grossAmount,
          status: LedgerStatus.PENDING
        }
      });

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
    releaseDate.setDate(releaseDate.getDate() + 7);

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
      await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          type: LedgerEntryType.WITHDRAWAL,
          amount: decimalAmount.negated(),
          status: LedgerStatus.AVAILABLE 
        }
      });

      const availableBalance = await this.getSellerBalance(sellerId, LedgerStatus.AVAILABLE, tx as any);
      
      if (availableBalance.lessThan(0)) {
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

      return { payout };
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
      where: {
        sellerId,
        periodStart,
        periodEnd
      }
    });

    if (existing) return existing;

    const entries = await prisma.sellerLedgerEntry.findMany({
      where: {
        sellerId,
        createdAt: { gte: periodStart, lte: periodEnd }
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
  },

  async getLedger(sellerId: string, limit = 50, cursor?: string, targetCurrency?: string) {
    const entries = await prisma.sellerLedgerEntry.findMany({
      where: { sellerId },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { seller: true }
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (entries.length > limit) {
      const nextItem = entries.pop();
      nextCursor = nextItem!.id;
    }

    const seller = entries[0]?.seller || await prisma.seller.findUnique({ where: { id: sellerId } });
    const currency = targetCurrency || seller?.currency || 'NGN';

    const localizedEntries = await Promise.all(entries.map(async entry => ({
      ...entry,
      amount: await currencyService.convert(entry.amount, 'NGN', currency),
      currency
    })));

    const availableBalance = await this.getSellerBalance(sellerId, LedgerStatus.AVAILABLE);
    const pendingBalance = await this.getSellerBalance(sellerId, LedgerStatus.PENDING);

    return {
      entries: localizedEntries,
      nextCursor,
      summary: {
        available: await currencyService.convert(availableBalance, 'NGN', currency),
        pending: await currencyService.convert(pendingBalance, 'NGN', currency),
        total: await currencyService.convert(availableBalance.add(pendingBalance), 'NGN', currency),
        currency
      }
    };
  }
};
