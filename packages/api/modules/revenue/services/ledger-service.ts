import { prisma, Decimal, LedgerEntryType } from '@ecom/db'

export const ledgerService = {
  async recordSale(orderLineId: string) {
    const line = await prisma.orderLine.findUnique({
      where: { id: orderLineId },
      include: { 
        variant: { include: { product: { include: { category: true } } } },
        package: true 
      }
    });

    if (!line) throw new Error('ORDER_LINE_NOT_FOUND');

    const sellerId = line.package.sellerId;
    const grossAmount = line.unitPrice.mul(line.quantity);
    const commissionRate = line.variant.product.category.commissionRate || new Decimal(10); // Default 10%
    const commissionAmount = grossAmount.mul(commissionRate).div(100);

    return await prisma.$transaction(async (tx) => {
      // 1. Record Gross Sale
      const saleEntry = await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          orderLineId,
          type: 'SALE' as LedgerEntryType,
          amount: grossAmount
        }
      });

      // 2. Record Platform Commission
      const commissionEntry = await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          orderLineId,
          type: 'COMMISSION' as LedgerEntryType,
          amount: commissionAmount.negated()
        }
      });

      return { saleEntry, commissionEntry };
    });
  },

  async recordPenalty(sellerId: string, amount: number, reason: string) {
    return await prisma.sellerLedgerEntry.create({
      data: {
        sellerId,
        type: 'PENALTY' as LedgerEntryType,
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
