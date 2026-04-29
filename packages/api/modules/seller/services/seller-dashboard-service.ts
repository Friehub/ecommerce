import { prisma, Decimal } from '@ecom/db'

export const sellerDashboardService = {
  async getMetrics(sellerId: string) {
    const packages = await prisma.orderPackage.findMany({
      where: { sellerId },
      include: { lines: true }
    });

    const pendingOrders = packages.filter(p => p.status === 'PENDING').length;
    const deliveredOrders = packages.filter(p => p.status === 'DELIVERED').length;

    // Calculate GMV
    const gmv = packages
      .filter(p => p.status !== 'CANCELLED')
      .reduce((acc, p) => {
        const packageTotal = p.lines.reduce((lAcc, l) => lAcc.add(l.unitPrice.mul(l.quantity)), new Decimal(0));
        return acc.add(packageTotal);
      }, new Decimal(0));

    // Low stock alerts
    const lowStockCount = await prisma.stockLevel.count({
      where: { sellerId, qtyOnHand: { lte: 10 } }
    });

    return {
      pendingOrders,
      deliveredOrders,
      gmv: gmv.toNumber(),
      lowStockCount,
      performanceScore: 4.8 // Placeholder for now
    };
  },

  async approveKYC(sellerId: string, adminId: string) {
    return prisma.seller.update({
      where: { id: sellerId },
      data: { status: 'ACTIVE' }
    });
  }
};
