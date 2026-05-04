import { prisma, Decimal } from '@ecom/db'

export const sellerDashboardService = {
  async getMetrics(sellerId: string) {
    const [pendingOrders, deliveredOrders] = await Promise.all([
      prisma.orderPackage.count({ where: { sellerId, status: 'PENDING' } }),
      prisma.orderPackage.count({ where: { sellerId, status: 'DELIVERED' } })
    ]);

    // Calculate GMV (Database level)
    const gmvAggregate = await prisma.orderLine.aggregate({
      where: { package: { sellerId, status: { not: 'CANCELLED' } } },
      _sum: { unitPrice: true, quantity: true } // Note: UnitPrice * Quantity cannot be summed directly in one aggregate easily with Prisma
    });
    
    // Better way for GMV: Simple query then sum in memory if records are many, OR better, a specialized view/table.
    // For now, I'll use a better findMany that only selects what's needed.
    const lines = await prisma.orderLine.findMany({
      where: { package: { sellerId, status: { not: 'CANCELLED' } } },
      select: { unitPrice: true, quantity: true }
    });
    const gmv = lines.reduce((acc, l) => acc.add(l.unitPrice.mul(l.quantity)), new Decimal(0));

    // Get actual revenue (Database level)
    const revenueAggregate = await prisma.sellerLedgerEntry.aggregate({
      where: { sellerId, type: { in: ['SALE', 'COMMISSION'] } },
      _sum: { amount: true }
    });
    const revenue = revenueAggregate._sum.amount || new Decimal(0);

    // Low stock alerts
    const lowStockCount = await prisma.stockLevel.count({
      where: { sellerId, qtyOnHand: { lte: 10 } }
    });

    // ... (rest of performance score logic is fine for now)
    // Dynamic Performance Score Calculation
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { rating: true }
    });
    
    const recentDisputes = await prisma.dispute.count({
      where: { 
        sellerId, 
        status: { in: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'] },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    let baseRating = seller?.rating ? seller.rating.toNumber() : 5.0;
    if (baseRating === 0) baseRating = 5.0;

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

  async setupPayoutAccount(sellerId: string, bankCode: string, bankAccountNumber: string, bankAccountName: string) {
    const { secretManager } = await import('../../shared/services/managers/secret-manager');
    const PAYSTACK_SECRET_KEY = secretManager.get('PAYSTACK_SECRET_KEY', 'sk_test_placeholder');
    let transferRecipientCode = `RCP_${Math.random().toString(36).substring(7).toUpperCase()}`;

    if (PAYSTACK_SECRET_KEY !== 'sk_test_placeholder') {
      try {
        const response = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'nuban',
            name: bankAccountName,
            account_number: bankAccountNumber,
            bank_code: bankCode,
            currency: 'NGN',
          }),
        });

        const data = await response.json();
        if (data.status) {
          transferRecipientCode = data.data.recipient_code;
        }
      } catch (err: any) {
        console.warn('Could not create Paystack transfer recipient, falling back to mock:', err.message);
      }
    }

    return prisma.seller.update({
      where: { id: sellerId },
      data: {
        bankCode,
        bankAccountNumber,
        bankAccountName,
        transferRecipientCode,
      },
    });
  },

  async uploadDocument(sellerId: string, type: string, url: string) {
    return prisma.sellerDocument.create({
      data: {
        sellerId,
        type,
        url,
        status: 'PENDING',
      }
    });
  },

  async getKYCStatus(sellerId: string) {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: { documents: true }
    });

    if (!seller) throw new Error('SELLER_NOT_FOUND');
    return seller.documents;
  }
};
