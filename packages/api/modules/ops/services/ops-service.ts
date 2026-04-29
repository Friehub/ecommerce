import { prisma } from '@ecom/db'

export const opsService = {
  async getGlobalMetrics() {
    const totalOrders = await prisma.order.count();
    const totalSellers = await prisma.seller.count({ where: { status: 'ACTIVE' } });
    const totalUsers = await prisma.user.count();

    const gmvResult = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { total: true }
    });

    return {
      totalOrders,
      totalSellers,
      totalUsers,
      gmv: gmvResult._sum.total?.toNumber() || 0,
      activeSessions: 142 // Placeholder for real-time data
    };
  },

  async logAdminAction(adminId: string, action: string, targetId: string, metadata: any) {
    return prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetId,
        metadata
      }
    });
  }
};
