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

  async requestPayout(sellerId: string, amount: number) {
    // 1. Verify seller has enough cleared balance
    // (In a real app, we'd have a 'ClearedBalance' ledger)
    
    return prisma.payoutRequest.create({
      data: {
        sellerId,
        amount: new Decimal(amount),
        status: 'PENDING'
      }
    });
  },

  async approvePayout(payoutId: string, adminId: string) {
    return prisma.payoutRequest.update({
      where: { id: payoutId },
      data: { status: 'COMPLETED' }
    });
  }
};
