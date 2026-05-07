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
  },

  async getAnalyticsTimeSeries() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, status: true }
    });

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    // Group by day
    const gmvByDay: Record<string, number> = {};
    const ordersByDay: Record<string, number> = {};
    const usersByDay: Record<string, number> = {};

    orders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0];
      ordersByDay[day] = (ordersByDay[day] || 0) + 1;
      if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status)) {
        gmvByDay[day] = (gmvByDay[day] || 0) + (o.total.toNumber() || 0);
      }
    });

    users.forEach(u => {
      const day = u.createdAt.toISOString().split('T')[0];
      usersByDay[day] = (usersByDay[day] || 0) + 1;
    });

    return {
      gmv: Object.entries(gmvByDay).map(([day, value]) => ({ day, value })),
      orders: Object.entries(ordersByDay).map(([day, value]) => ({ day, value })),
      users: Object.entries(usersByDay).map(([day, value]) => ({ day, value }))
    };
  }
};
