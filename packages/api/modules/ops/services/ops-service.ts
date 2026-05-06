import { prisma } from '@ecom/db'
import type { Service } from '../../../types.js'

export const opsService: Service = {
  async getGlobalMetrics() {
    const totalOrders = await prisma.order.count();
    const totalSellers = await prisma.seller.count({ where: { status: 'ACTIVE' } });
    const totalUsers = await prisma.user.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const gmvResult = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED'] }
      },
      _sum: { total: true }
    });

    const gmv30dResult = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED'] },
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: { total: true }
    });

    const activeSessions = await prisma.session.count({
      where: {
        expiresAt: { gt: new Date() }
      }
    });

    const openDisputes = await prisma.dispute.count({
      where: { status: 'OPEN' }
    });

    const gmv = gmvResult._sum.total?.toNumber() || 0;
    const gmv30d = gmv30dResult._sum.total?.toNumber() || 0;

    return {
      totalOrders,
      totalSellers,
      activeSellers: totalSellers,
      totalUsers,
      gmv,
      totalGmv30d: gmv30d,
      activeSessions,
      openDisputes
    };
  },

  async logAdminAction(adminId: string, action: string, targetId: string, metadata: any) {
    return prisma.eventLog.create({
      data: {
        topic: 'ADMIN_ACTION',
        payload: { adminId, action, targetId, metadata }
      }
    });
  }
};
