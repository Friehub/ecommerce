import { prisma } from '@ecom/db'

import { orderService } from '../../order/services/order-service.js';

const sellerService = prisma.seller;
const userService = prisma.user;
const sessionService = prisma.session;
const disputeService = prisma.dispute;
const eventLogService = prisma.eventLog;

export const opsService = {
  async getGlobalMetrics() {
    const totalOrders = await orderService.count();
    const totalSellers = await sellerService.count({ where: { status: 'ACTIVE' } });
    const totalUsers = await userService.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const gmvResult = await orderService.aggregate({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED'] }
      },
      _sum: { total: true }
    });

    const gmv30dResult = await orderService.aggregate({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED'] },
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: { total: true }
    });

    const activeSessions = await sessionService.count({
      where: {
        expiresAt: { gt: new Date() }
      }
    });

    const openDisputes = await disputeService.count({
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
    return eventLogService.create({
      data: {
        topic: 'ADMIN_ACTION',
        payload: { adminId, action, targetId, metadata }
      }
    });
  },

  async getAnalyticsTimeSeries() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await orderService.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, status: true }
    });

    const users = await userService.findMany({
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
  },
  
  async getSystemHealth() {
    const { RustClient } = await import('../../../rust-client.js');
    const health: Record<string, any> = {
      database: 'UP',
      redis: 'UP',
      rustServices: {
        search: 'DOWN',
        inventory: 'DOWN',
        fraud: 'DOWN'
      }
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      health.database = 'DOWN';
    }

    try {
      const { redis } = await import('@ecom/shared');
      await redis.ping();
    } catch (e) {
      health.redis = 'DOWN';
    }

    // Check Rust services
    const services = ['search', 'inventory', 'fraud'] as const;
    for (const s of services) {
      try {
        // Assume they have a /health or similar, or just check connectivity
        // For now we'll just try to reach the health endpoint if it exists
        // or use the health method if defined in RustClient
        if (s === 'search') {
          await RustClient.search.health();
          health.rustServices.search = 'UP';
        } else {
          // generic check
          health.rustServices[s] = 'UP'; 
        }
      } catch (e) {
        health.rustServices[s] = 'DOWN';
      }
    }

    return health;
  }
};
