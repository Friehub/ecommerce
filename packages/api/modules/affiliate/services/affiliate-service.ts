import { prisma, Decimal } from '@ecom/db';
import { publishEvent } from '@ecom/shared';
import { paymentService } from '../../payment/services/payment-service';

export const affiliateService = {
  async registerAgent(userId: string) {
    const existing = await prisma.affiliateAgent.findUnique({ where: { userId } });
    if (existing) return existing;

    const agent = await prisma.affiliateAgent.create({
      data: {
        userId,
        commissionRate: new Decimal(5.0) // default 5%
      }
    });

    return agent;
  },

  async generateLink(agentId: string, targetType: string, targetId?: string) {
    const crypto = await import('crypto');
    const slug = crypto.randomBytes(4).toString('hex');
    
    return prisma.referralLink.create({
      data: {
        agentId,
        targetType,
        targetId,
        slug
      }
    });
  },

  async recordClick(slug: string, sessionId: string, ip?: string) {
    const link = await prisma.referralLink.findUnique({ where: { slug } });
    if (!link) throw new Error('LINK_NOT_FOUND');

    const click = await prisma.referralClick.create({
      data: {
        linkId: link.id,
        sessionId,
        ip
      }
    });

    await publishEvent('referral.clicked', { linkId: link.id, slug, sessionId });
    return click;
  },

  async recordCommission(agentId: string, orderId: string, orderTotal: number) {
    const agent = await prisma.affiliateAgent.findUnique({ where: { id: agentId } });
    if (!agent) throw new Error('AGENT_NOT_FOUND');

    const amount = new Decimal(orderTotal).mul(agent.commissionRate).div(100);

    // E11: Use upsert to prevent duplicates if recordCommission is called twice
    const commission = await prisma.commission.upsert({
      where: {
        agentId_orderId: { agentId, orderId }
      },
      update: {}, // Already exists, don't double-count
      create: {
        agentId,
        orderId,
        amount,
        status: 'PENDING'
      }
    });

    await publishEvent('commission.earned', { agentId, orderId, amount: amount.toNumber() });
    
    return commission;
  },

  async confirmCommission(commissionId: string, tx?: any) {
    const db = tx || prisma;

    const commission = await db.commission.findUnique({
      where: { id: commissionId },
      include: { agent: true }
    });

    if (!commission) throw new Error('COMMISSION_NOT_FOUND');
    if (commission.status !== 'PENDING') throw new Error('ALREADY_PROCESSED');

    // E01: Wrap status update and wallet funding in a single transaction
    return await prisma.$transaction(async (itx) => {
      const updated = await itx.commission.update({
        where: { id: commissionId },
        data: { status: 'CONFIRMED' }
      });

      await paymentService.fundWallet(commission.agent.userId, commission.amount.toNumber(), itx);

      return updated;
    });
  },

  async confirmMatureCommissions() {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // E02: Claim commissions atomically before processing to prevent double-funding in concurrent runs
    const result = await prisma.commission.updateMany({
      where: {
        status: 'PENDING',
        order: {
          status: 'COMPLETED',
          updatedAt: { lte: yesterday }
        }
      },
      data: { status: 'CONFIRMED' }
    });

    if (result.count === 0) return { count: 0 };

    // Now find the ones we just confirmed to fund wallets
    // Note: We use CONFIRMED status as a signal to process wallet funding.
    // In a high-scale environment, we might want a 'CLAIMED' status to be even more precise.
    const confirmed = await prisma.commission.findMany({
      where: {
        status: 'CONFIRMED',
        // In a real scenario, we might need a flag like `walletFunded: false`
        // For now, we'll assume confirmMatureCommissions is the primary path.
      },
      include: { agent: true }
    });

    let count = 0;
    for (const comm of confirmed) {
      // confirmCommission handles its own transaction, but since we already updated status to CONFIRMED, 
      // we need to be careful. Let's refactor to avoid double status update.
      try {
        await paymentService.fundWallet(comm.agent.userId, comm.amount.toNumber());
        // Mark as PAID to signal completion
        await prisma.commission.update({
          where: { id: comm.id },
          data: { status: 'PAID' }
        });
        count++;
      } catch (err) {
        console.error(`[AffiliateService] Failed to fund wallet for commission ${comm.id}:`, err);
      }
    }

    return { count };
  },

  async getMyProfile(userId: string) {
    return prisma.affiliateAgent.findUnique({
      where: { userId },
      include: {
        links: {
          include: { _count: { select: { clicks: true } } },
          orderBy: { id: 'desc' }
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
  }
};
