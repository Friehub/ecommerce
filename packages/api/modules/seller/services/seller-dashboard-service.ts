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

    // Dynamic Performance Score Calculation
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { rating: true }
    });
    
    // Penalize score based on unresolved or rejected disputes
    const recentDisputes = await prisma.dispute.count({
      where: { 
        sellerId, 
        status: { in: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'] }, // RESOLVED means resolved in buyer's favor usually
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    let baseRating = seller?.rating ? seller.rating.toNumber() : 5.0;
    if (baseRating === 0) baseRating = 5.0; // new sellers start at 5.0

    // Deduct 0.1 per dispute
    let performanceScore = Math.max(0, baseRating - (recentDisputes * 0.1));
    performanceScore = Math.round(performanceScore * 10) / 10;

    return {
      pendingOrders,
      deliveredOrders,
      gmv: gmv.toNumber(),
      revenue: revenue.toNumber(),
      lowStockCount,
      performanceScore
    };
  },

  async approveKYC(sellerId: string, adminId: string) {
    return prisma.seller.update({
      where: { id: sellerId },
      data: { status: 'ACTIVE' }
    });
  }
};
