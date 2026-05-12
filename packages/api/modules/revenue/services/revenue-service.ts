import { prisma, Decimal, LedgerEntryType, LedgerStatus } from '@ecom/db'
import type { Service } from '../../../types.js'
import { ledgerService } from './ledger-service.js'

export const revenueService: Service = {
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
      const rate = new Decimal(line.variant.product.category.commissionRate || 10).div(100);
      totalCommission = totalCommission.add(lineTotal.mul(rate));
      totalRevenue = totalRevenue.add(lineTotal);
    }

    return { totalRevenue, totalCommission, sellerNet: totalRevenue.sub(totalCommission) };
  },

  async getSellerStats(sellerId: string) {
    const pendingBalance = await ledgerService.getSellerBalance(sellerId, LedgerStatus.PENDING);
    const availableBalance = await ledgerService.getSellerBalance(sellerId, LedgerStatus.AVAILABLE);

    const entries = await prisma.sellerLedgerEntry.findMany({
      where: { sellerId }
    });

    const totalSales = entries
      .filter(e => e.type === LedgerEntryType.SALE)
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0));

    const totalCommission = entries
      .filter(e => e.type === LedgerEntryType.COMMISSION)
      .reduce((acc, e) => acc.add(e.amount), new Decimal(0)).abs();

    return {
      pendingBalance,
      availableBalance,
      totalSales,
      totalCommission,
      netRevenue: totalSales.sub(totalCommission)
    };
  },

  async requestPayout(sellerId: string, amount: number) {
    return await ledgerService.withdrawFunds(sellerId, amount);
  },

  async updatePayoutAccount(sellerId: string, params: { bankCode: string, accountNumber: string, accountName: string }) {
    // Import paymentService dynamically or use it directly if available in scope
    const { paymentService } = await import('../../payment/services/payment-service.js');
    return await paymentService.setupPayoutAccount(sellerId, params);
  },

  async approvePayout(payoutId: string, adminId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: { seller: true }
    });

    if (!payout) throw new Error('PAYOUT_NOT_FOUND');
    if (payout.status !== 'PENDING') throw new Error('PAYOUT_ALREADY_PROCESSED');

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

    if (PAYSTACK_SECRET_KEY === 'sk_test_placeholder') {
      throw new Error('PAYOUT_SIMULATION_BLOCKED: A valid PAYSTACK_SECRET_KEY is required for all payout processing.');
    }

    // Production: real API via paymentService
    const { paymentService } = await import('../../payment/services/payment-service.js');
    return await paymentService.initiatePayout(payoutId);
  }
};
