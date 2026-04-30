import { prisma, Decimal } from '@ecom/db'

export const revenueService = {
  async calculateCommission(packageId: string) {
    const pkg = await prisma.orderPackage.findUnique({
      where: { id: packageId },
      include: { lines: { include: { variant: { include: { product: { include: { category: true } } } } } } }
    });

    if (!pkg) throw new Error('PACKAGE_NOT_FOUND');

    let totalCommission = new Decimal(0);
    let totalRevenue = new Decimal(0);

    for (const line of pkg.lines) {
      const lineTotal = line.unitPrice.mul(line.quantity);
      const rate = new Decimal(line.variant.product.category.commissionRate).div(100);
      totalCommission = totalCommission.add(lineTotal.mul(rate));
      totalRevenue = totalRevenue.add(lineTotal);
    }

    return { totalRevenue, totalCommission, sellerNet: totalRevenue.sub(totalCommission) };
  },

  async getSellerStats(sellerId: string) {
    const entries = await prisma.sellerLedgerEntry.findMany({
      where: { sellerId }
    });

    const pending = entries
      .filter(e => e.status === 'PENDING')
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const available = entries
      .filter(e => e.status === 'AVAILABLE')
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const totalSales = entries
      .filter(e => e.type === 'SALE')
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const totalCommission = entries
      .filter(e => e.type === 'COMMISSION')
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0)).abs();

    return {
      pendingBalance: pending,
      availableBalance: available,
      totalSales,
      totalCommission,
      netRevenue: totalSales.sub(totalCommission)
    };
  },

  async requestPayout(sellerId: string, amount: number) {
    const stats = await this.getSellerStats(sellerId);
    
    if (stats.availableBalance.lt(new Decimal(amount))) {
      throw new Error('INSUFFICIENT_FUNDS');
    }
    
    return prisma.$transaction(async (tx) => {
      // 1. Create payout request
      const payout = await tx.payoutRequest.create({
        data: {
          sellerId,
          amount: new Decimal(amount),
          status: 'PENDING'
        }
      });

      // 2. Deduct from available balance (as a negative ledger entry)
      await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          type: 'PENALTY', // Reusing PENALTY or could add WITHDRAWAL
          amount: new Decimal(amount).negated(),
          status: 'AVAILABLE',
          availableAt: new Date()
        }
      });

      return payout;
    });
  },
};
