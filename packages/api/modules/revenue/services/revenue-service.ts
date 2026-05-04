import { prisma } from '@ecom/db';

export const revenueService = {
  async approvePayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: { seller: true }
    });

    if (!payout) throw new Error('PAYOUT_NOT_FOUND');
    if (payout.status !== 'PENDING') throw new Error('PAYOUT_ALREADY_PROCESSED');

    const { secretManager } = await import('../../shared/services/managers/secret-manager');
    const paystackSecret = secretManager.paystackSecret;

    if (paystackSecret !== 'sk_test_placeholder' && payout.seller.transferRecipientCode) {
      try {
        const response = await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'balance',
            reason: `Payout for seller ${payout.seller.businessName}`,
            amount: payout.amount.mul(100).toNumber(),
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
            bankRef: `ERR-${err.message || 'Unknown error'}`
          }
        });
      }
    }

    if (paystackSecret === 'sk_test_placeholder' && !secretManager.isDevelopment) {
      throw new Error('PAYOUT_SIMULATION_BLOCKED_IN_PRODUCTION: Missing Paystack Secret');
    }

    // Default simulation
    return await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'SUCCESS',
        bankRef: `SIM-${Date.now()}`
      }
    });
  },

  async getRevenueStats(sellerId: string) {
    const revenue = await prisma.order.aggregate({
      where: { 
        sellerId,
        status: 'DELIVERED'
      },
      _sum: {
        totalAmount: true
      }
    });
    
    return {
      totalRevenue: revenue._sum.totalAmount || 0
    };
  }
};
