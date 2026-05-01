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
      where: { id: payoutId }
    });

    if (!payout) throw new Error('PAYOUT_NOT_FOUND');
    
    // In production, you would fetch Seller details like transferRecipientCode here
    // and make a POST request to https://api.paystack.co/transfer
    // For now, if no bank details exist on Seller model, we simulate it as real.
    
    return await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'SUCCESS',
        bankRef: `SIM-${Math.random().toString(36).substring(7).toUpperCase()}`
      }
    });
  }
};
