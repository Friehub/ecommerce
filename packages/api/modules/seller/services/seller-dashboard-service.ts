import { prisma, Decimal } from '@ecom/db'

const orderPackageService = prisma.orderPackage;
const sellerLedgerEntryService = prisma.sellerLedgerEntry;
const stockLevelService = prisma.stockLevel;
const sellerService = prisma.seller;
const disputeService = prisma.dispute;
const sellerDocumentService = prisma.sellerDocument;

export const sellerDashboardService = {
  async getMetrics(sellerId: string) {
    const packages = await orderPackageService.findMany({
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
    const ledgerEntries = await sellerLedgerEntryService.findMany({
      where: { sellerId, type: { in: ['SALE', 'COMMISSION'] } }
    });
    const netRevenue = ledgerEntries.reduce((acc, entry) => acc.add(entry.amount), new Decimal(0));

    // Low stock alerts
    const lowStockCount = await stockLevelService.count({
      where: { sellerId, qtyOnHand: { lte: 10 } }
    });

    // 1. Buyer Review Score (50%)
    const seller = await sellerService.findUnique({
      where: { id: sellerId },
      select: { rating: true }
    });
    let rating = seller?.rating ? seller.rating.toNumber() : 5.0;
    if (rating === 0) rating = 5.0; // Default for new sellers

    // 2. On-time Shipment Rate (25%)
    // Consider packages that have been handed over to logistics
    const shippedPackages = await orderPackageService.findMany({
      where: { 
        sellerId, 
        status: { in: ['READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] } 
      },
      include: { shipments: { take: 1, orderBy: { createdAt: 'asc' } } }
    });
    const onTimeShipments = shippedPackages.filter(pkg => {
      if (!pkg.estimatedDelivery || pkg.shipments.length === 0) return true;
      return pkg.shipments[0].createdAt <= pkg.estimatedDelivery;
    }).length;
    const onTimeRate = shippedPackages.length > 0 ? onTimeShipments / shippedPackages.length : 1.0;

    // 3. Cancellation Rate (15%) - Lower is better
    const totalPackages = await orderPackageService.count({ where: { sellerId } });
    const cancelledPackages = await orderPackageService.count({ 
      where: { sellerId, status: 'CANCELLED' } 
    });
    const cancellationRate = totalPackages > 0 ? cancelledPackages / totalPackages : 0.0;

    // 4. Dispute Loss Rate (10%) - Lower is better
    const totalDisputes = await disputeService.count({ where: { sellerId } });
    const lostDisputes = await disputeService.count({ 
      where: { sellerId, status: 'RESOLVED' } 
    });
    const disputeLossRate = totalDisputes > 0 ? lostDisputes / totalDisputes : 0.0;

    // Weighted Formula (0-5 scale)
    let performanceScore = (rating * 0.5) + 
                           (onTimeRate * 5 * 0.25) + 
                           ((1 - cancellationRate) * 5 * 0.15) + 
                           ((1 - disputeLossRate) * 5 * 0.10);

    performanceScore = Math.round(performanceScore * 10) / 10;

    return {
      pendingOrders,
      deliveredOrders,
      gmv: gmv.toNumber(),
      netRevenue: netRevenue.toNumber(),
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

    return sellerService.update({
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
    return sellerDocumentService.create({
      data: {
        sellerId,
        type,
        url,
        status: 'PENDING',
      }
    });
  },

  async getKYCStatus(sellerId: string) {
    const seller = await sellerService.findUnique({
      where: { id: sellerId },
      include: { documents: true }
    });

    if (!seller) throw new Error('SELLER_NOT_FOUND');
    return seller.documents;
  }
};
