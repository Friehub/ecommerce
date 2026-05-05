import { prisma, Decimal, LedgerEntryType, LedgerStatus } from '@ecom/db'
import { ledgerService } from './ledger-service'

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

  async approvePayout(payoutId: string, adminId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: { seller: true }
    });

    if (!payout) throw new Error('PAYOUT_NOT_FOUND');
    if (payout.status !== 'PENDING') throw new Error('PAYOUT_ALREADY_PROCESSED');

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

    // B07: Simulation block must be guarded and at the top as early return
    if (PAYSTACK_SECRET_KEY === 'sk_test_placeholder' || process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV === 'production' && PAYSTACK_SECRET_KEY === 'sk_test_placeholder') {
        throw new Error('PAYOUT_SIMULATION_BLOCKED_IN_PRODUCTION: Missing Paystack Secret');
      }

      // Simulation for non-prod
      if (process.env.NODE_ENV !== 'production') {
        return await prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: 'SUCCESS',
            bankRef: `SIM-${Math.random().toString(36).substring(7).toUpperCase()}`
          }
        });
      }
    }

    // Production: real API only, throw on any failure
    try {
      const response = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          reason: `Payout for seller ${payout.seller.businessName}`,
          amount: payout.amount.mul(100).toNumber(), // Paystack expects amount in kobo
          recipient: payout.seller.transferRecipientCode
        }),
      });

      const data = await response.json();
      if (data.status) {
        return await prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: 'SUCCESS',
            bankRef: data.data.reference || `PAY-${Date.now()}`
          }
        });
      } else {
        return await prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: 'FAILED',
            bankRef: `ERR-${data.message || 'Unknown Error'}`
          }
        });
      }
    } catch (err: any) {
      console.error('Paystack transfer failed:', err);
      return await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'FAILED',
          bankRef: `ERR-${err.message || 'Unknown error during fetch'}`
        }
      });
    }
  }
};
