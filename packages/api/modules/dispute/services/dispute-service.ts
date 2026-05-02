import { prisma } from '@ecom/db';
import { publishEvent, queues } from '@ecom/shared';

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

    // 3. Schedule auto-escalation check (72 hours)
    await queues.orderQueue.add('dispute-auto-escalate', { disputeId: dispute.id }, { delay: 72 * 60 * 60 * 1000 });

    return dispute;
  },

  async escalateDispute(disputeId: string, userId: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    // Only buyer can manually escalate if they feel seller is not cooperating
    if (dispute.buyerId !== userId) throw new Error('UNAUTHORIZED');

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'ESCALATED' }
    });

    await publishEvent('dispute.escalated', { disputeId, reason: 'MANUAL_ESCALATION' });

    return updated;
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
    
    // Ensure the caller is either the buyer, the seller, or an admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (dispute.buyerId !== userId && dispute.sellerId !== userId && !isAdmin) {
      throw new Error('UNAUTHORIZED');
    }

    return dispute;
  },

  async getMyDisputes(userId: string) {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    
    return prisma.dispute.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: seller?.id || 'NON_EXISTENT' }
        ]
      },
      include: {
        order: { select: { id: true, total: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
};
