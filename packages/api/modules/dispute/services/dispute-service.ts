import { prisma } from '@ecom/db';
import { publishEvent, queues } from '@ecom/shared';
import { orderService } from '../../order/services/order-service.js';

const orderLineService = prisma.orderLine;
const sellerService = prisma.seller;
const disputeMessageService = prisma.disputeMessage;
const disputeEvidenceService = prisma.disputeEvidence;
const userService = prisma.user;

export const disputeService = {
  // Prisma delegates
  findUnique: prisma.dispute.findUnique,
  findFirst: prisma.dispute.findFirst,
  findMany: prisma.dispute.findMany,
  create: prisma.dispute.create,
  update: prisma.dispute.update,
  delete: prisma.dispute.delete,
  count: prisma.dispute.count,
  async openDispute(buyerId: string, orderId: string, reason: string, orderLineId?: string) {
    // 1. Verify the order belongs to the buyer
    const order = await orderService.findUnique({
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
      const line = await orderLineService.findUnique({
        where: { id: orderLineId },
        include: { package: true }
      });
      if (line) sellerId = line.package.sellerId;
    }

    if (!sellerId) throw new Error('SELLER_NOT_FOUND_FOR_ORDER');

    // 2. Create the dispute
    const dispute = await disputeService.create({
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
    const dispute = await disputeService.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    // Only buyer can manually escalate if they feel seller is not cooperating
    if (dispute.buyerId !== userId) throw new Error('UNAUTHORIZED');

    const updated = await disputeService.update({
      where: { id: disputeId },
      data: { status: 'ESCALATED' }
    });

    await publishEvent('dispute.escalated', { disputeId, reason: 'MANUAL_ESCALATION' });

    return updated;
  },

  async respondToDispute(disputeId: string, senderId: string, content: string) {
    const dispute = await disputeService.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');
    
    // E05: senderId is a User.id, but dispute.sellerId is a Seller.id.
    // We must resolve the seller to check authorization.
    const seller = await sellerService.findUnique({ where: { userId: senderId } });
    const isParticipant = dispute.buyerId === senderId || (seller && dispute.sellerId === seller.id);

    if (!isParticipant) {
      throw new Error('UNAUTHORIZED');
    }

    const message = await disputeMessageService.create({
      data: {
        disputeId,
        senderId,
        content
      }
    });

    // Update dispute status to UNDER_REVIEW if it's the seller's response
    if (dispute.status === 'OPEN' && seller && senderId === seller.userId && dispute.sellerId === seller.id) {
      await disputeService.update({
        where: { id: disputeId },
        data: { status: 'UNDER_REVIEW' }
      });
    }

    return message;
  },

  async uploadEvidence(disputeId: string, uploaderId: string, url: string, type: string) {
    const dispute = await disputeService.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');
    
    // E05: Fix auth check for sellers (uploaderId is a User.id)
    const seller = await sellerService.findUnique({ where: { userId: uploaderId } });
    const isParticipant = dispute.buyerId === uploaderId || (seller && dispute.sellerId === seller.id);

    if (!isParticipant) {
      throw new Error('UNAUTHORIZED');
    }

    return disputeEvidenceService.create({
      data: {
        disputeId,
        url,
        type
      }
    });
  },

  async getDisputeThread(disputeId: string, userId: string) {
    const user = await userService.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');
    const isAdmin = user.role === 'ADMIN';

    const dispute = await disputeService.findUnique({
      where: { id: disputeId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        evidence: true,
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, businessName: true } }
      }
    });

    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');
    
    // E05: Fix auth check for sellers (userId is a User.id)
    const seller = await sellerService.findUnique({ where: { userId } });
    const isParticipant = dispute.buyerId === userId || (seller && dispute.sellerId === seller.id);

    if (!isParticipant && !isAdmin) {
      throw new Error('UNAUTHORIZED');
    }

    return dispute;
  },

  async getMyDisputes(userId: string) {
    const seller = await sellerService.findUnique({ where: { userId } });
    
    // B13: Dynamically build OR clauses to avoid nonsense fallbacks
    const orClauses: any[] = [{ buyerId: userId }];
    if (seller) {
      orClauses.push({ sellerId: seller.id });
    }

    return disputeService.findMany({
      where: {
        OR: orClauses
      },
      include: {
        order: { select: { id: true, total: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
};
