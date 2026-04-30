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

    // Get actual revenue from ledger
    const ledgerEntries = await prisma.sellerLedgerEntry.findMany({
      where: { sellerId }
    });
    const revenue = ledgerEntries.reduce((acc, entry) => acc.add(entry.amount), new Decimal(0));

    // Low stock alerts
    const lowStockCount = await prisma.stockLevel.count({
      where: { sellerId, qtyOnHand: { lte: 10 } }
    });

    return {
      pendingOrders,
      deliveredOrders,
      gmv: gmv.toNumber(),
      revenue: revenue.toNumber(),
      lowStockCount,
      performanceScore: 4.8 
    };
  },

  async approveKYC(sellerId: string, adminId: string) {
    return prisma.seller.update({
      where: { id: sellerId },
      data: { status: 'ACTIVE' }
    });
  }
};
