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

    const commission = await prisma.commission.create({
      data: {
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

    const updateLogic = async (innerTx: any) => {
      const updated = await innerTx.commission.update({
        where: { id: commissionId },
        data: { status: 'CONFIRMED' }
      });

      await paymentService.fundWallet(commission.agent.userId, commission.amount.toNumber());
      return updated;
    };

    return tx ? await updateLogic(tx) : await prisma.$transaction(updateLogic);
  },

  async confirmMatureCommissions() {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const pending = await prisma.commission.findMany({
      where: {
        status: 'PENDING',
        order: {
          status: 'COMPLETED',
          updatedAt: { lte: yesterday }
        }
      },
      include: { agent: true }
    });

    if (pending.length === 0) return { count: 0 };

    await prisma.$transaction(async (tx) => {
      for (const comm of pending) {
        await tx.commission.update({
          where: { id: comm.id },
          data: { status: 'CONFIRMED' }
        });
        await paymentService.fundWallet(comm.agent.userId, comm.amount.toNumber());
      }
    });

    return { count: pending.length };
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
