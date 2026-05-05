import { prisma, Decimal } from '@ecom/db'
import type { Service } from '../../../types'

export const sellerDashboardService: Service = {
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
      where: { sellerId, type: { in: ['SALE', 'COMMISSION'] } }
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

  async setupPayoutAccount(sellerId: string, bankCode: string, bankAccountNumber: string, bankAccountName: string) {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
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
