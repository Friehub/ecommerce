import { prisma } from '@ecom/db';
import { publishEvent } from '@ecom/shared';

export const disputeService = {
  async openDispute(buyerId: string, orderId: string, reason: string, orderLineId?: string) {
    // 1. Verify the order belongs to the buyer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        packages: true
      }
    });

    if (!order || order.userId !== buyerId) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Determine the seller (For MVP, we assume disputes are package/seller specific,
    // if no orderLineId is provided, we pick the first package's seller as fallback)
    let sellerId = order.packages[0]?.sellerId;
    if (orderLineId) {
      const line = await prisma.orderLine.findUnique({
        where: { id: orderLineId },
        include: { package: true }
      });
      if (line) sellerId = line.package.sellerId;
    }

    if (!sellerId) throw new Error('SELLER_NOT_FOUND_FOR_ORDER');

    // 2. Create the dispute
    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        orderLineId,
        buyerId,
        sellerId,
        reason,
        status: 'OPEN',
      }
    });

    await publishEvent('dispute.opened', { disputeId: dispute.id, orderId, buyerId, sellerId });

    return dispute;
  },

  async respondToDispute(disputeId: string, senderId: string, content: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');
    
    // Authorization check
    if (dispute.buyerId !== senderId && dispute.sellerId !== senderId) {
      // In a real scenario, an admin might also be able to respond. 
      // This simple check works for buyer/seller.
      throw new Error('UNAUTHORIZED');
    }

    const message = await prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId,
        content
      }
    });

    // Update dispute status to UNDER_REVIEW if it's the seller's first response
    if (dispute.status === 'OPEN' && senderId === dispute.sellerId) {
      await prisma.dispute.update({
        where: { id: disputeId },
        data: { status: 'UNDER_REVIEW' }
      });
    }

    return message;
  },

  async uploadEvidence(disputeId: string, uploaderId: string, url: string, type: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');
    
    if (dispute.buyerId !== uploaderId && dispute.sellerId !== uploaderId) {
      throw new Error('UNAUTHORIZED');
    }

    return prisma.disputeEvidence.create({
      data: {
        disputeId,
        url,
        type
      }
    });
  },

  async getDisputeThread(disputeId: string, userId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        evidence: true,
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, businessName: true } }
      }
    });

    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');
    
    // Ensure the caller is either the buyer or the seller
    if (dispute.buyerId !== userId && dispute.sellerId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    return dispute;
  }
};
