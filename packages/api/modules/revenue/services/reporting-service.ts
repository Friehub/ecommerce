import { prisma, Decimal, LedgerEntryType } from '@ecom/db'

const sellerLedgerEntryService = prisma.sellerLedgerEntry;

export const reportingService = {
  async exportStatement(sellerId: string, startDate: Date, endDate: Date) {
    const entries = await sellerLedgerEntryService.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'asc' },
      include: { orderLine: { include: { package: { include: { order: true } } } } }
    });

    let runningBalance = new Decimal(0);
    const rows = [
      ['Date', 'Type', 'Description', 'Order Ref', 'Amount', 'Balance'].join(',')
    ];

    for (const entry of entries) {
      runningBalance = runningBalance.add(entry.amount);
      const orderRef = entry.orderLine?.package?.order?.id || 'N/A';
      const row = [
        entry.createdAt.toISOString(),
        entry.type,
        `Ledger entry ${entry.id}`,
        orderRef,
        entry.amount.toFixed(2),
        runningBalance.toFixed(2)
      ];
      rows.push(row.map(cell => `"${cell}"`).join(','));
    }

    return rows.join('\n');
  },

  async getSettlementReport(startDate: Date, endDate: Date) {
    const entries = await sellerLedgerEntryService.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const report = {
      grossSales: new Decimal(0),
      commissions: new Decimal(0),
      payouts: new Decimal(0),
      penalties: new Decimal(0),
      refunds: new Decimal(0),
      netPlatform: new Decimal(0)
    };

    for (const entry of entries) {
      const amount = entry.amount;
      switch (entry.type) {
        case LedgerEntryType.SALE:
          report.grossSales = report.grossSales.add(amount);
          break;
        case LedgerEntryType.COMMISSION:
          report.commissions = report.commissions.add(amount.abs());
          break;
        case LedgerEntryType.WITHDRAWAL:
          report.payouts = report.payouts.add(amount.abs());
          break;
        case LedgerEntryType.PENALTY:
          report.penalties = report.penalties.add(amount.abs());
          break;
        case LedgerEntryType.REFUND:
          report.refunds = report.refunds.add(amount.abs());
          break;
      }
    }

    report.netPlatform = report.commissions.add(report.penalties).sub(report.refunds);
    
    return report;
  }
};
