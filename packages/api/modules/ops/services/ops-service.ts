import { prisma } from '@ecom/db'

export const opsService = {
  async getGlobalMetrics() {
    const totalOrders = await prisma.order.count();
    const totalSellers = await prisma.seller.count({ where: { status: 'ACTIVE' } });
    const totalUsers = await prisma.user.count();

    const gmvResult = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED'] }
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

    return {
      totalOrders,
      totalSellers,
      activeSellers: totalSellers,
      totalUsers,
      gmv,
      totalGmv30d: gmv,
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
