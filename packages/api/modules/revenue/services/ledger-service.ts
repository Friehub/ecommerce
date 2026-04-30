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

  async releaseMatureEscrow() {
    const now = new Date();
    return await prisma.sellerLedgerEntry.updateMany({
      where: {
        status: LedgerStatus.PENDING,
        availableAt: { lte: now }
      },
      data: {
        status: LedgerStatus.AVAILABLE
      }
    });
  },

  async recordPenalty(sellerId: string, amount: number, reason: string) {
    return await prisma.sellerLedgerEntry.create({
      data: {
        sellerId,
        type: LedgerEntryType.PENALTY,
        amount: new Decimal(amount).negated()
      }
    });
  },

  async getSellerBalance(sellerId: string) {
    const entries = await prisma.sellerLedgerEntry.findMany({
      where: { sellerId }
    });

    return entries.reduce((acc, entry) => acc.add(entry.amount), new Decimal(0));
  }
};
