import { prisma } from '@ecom/db';
import { paymentService } from '../../payment/services/payment-service';
import { publishEvent } from '@ecom/shared';

export const adminService = {
  async approveSellerKYC(adminId: string, sellerId: string) {
    const seller = await prisma.seller.update({
      where: { id: sellerId },
      data: { status: 'ACTIVE' }
    });

    await publishEvent('seller.approved', { sellerId: seller.id });
    
    // Log the action
    await prisma.eventLog.create({
      data: {
        topic: 'ADMIN_ACTION',
        payload: { adminId, action: 'APPROVE_SELLER', targetId: sellerId }
      }
    });

    return seller;
  },

  async getDisputeQueue() {
    return prisma.dispute.findMany({
      where: {
        status: { in: ['OPEN', 'UNDER_REVIEW'] }
      },
      include: {
        buyer: { select: { id: true, email: true, firstName: true, lastName: true } },
        seller: { select: { id: true, businessName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async resolveDispute(adminId: string, disputeId: string, resolution: 'RESOLVED' | 'REJECTED', refundAmount?: number) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: true }
    });

    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: { status: resolution }
      });

      if (resolution === 'RESOLVED' && refundAmount && refundAmount > 0) {
        // Trigger refund via payment service (funding the wallet)
        await paymentService.fundWallet(dispute.buyerId, refundAmount);
        await publishEvent('refund.processed', { orderId: dispute.orderId, amount: refundAmount, userId: dispute.buyerId });
      }

      await tx.eventLog.create({
        data: {
          topic: 'ADMIN_ACTION',
          payload: { adminId, action: 'RESOLVE_DISPUTE', targetId: disputeId, resolution, refundAmount }
        }
      });

      await publishEvent('dispute.resolved', { disputeId, resolution });

      return updatedDispute;
    });
  },

  async manualRefund(adminId: string, orderId: string, amount: number, reason: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('ORDER_NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      // Refund directly to wallet
      await paymentService.fundWallet(order.userId, amount);
      
      await tx.eventLog.create({
        data: {
          topic: 'ADMIN_ACTION',
          payload: { adminId, action: 'MANUAL_REFUND', targetId: orderId, amount, reason }
        }
      });

      await publishEvent('refund.processed', { orderId, amount, userId: order.userId, reason });

      return { success: true, refundedAmount: amount };
    });
  }
};
