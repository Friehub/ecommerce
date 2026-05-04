import { prisma, PackageStatus, OrderStatus } from '@ecom/db'
import { publishEvent } from '@ecom/shared'

export const packageService = {
  async updateStatus(packageId: string, sellerId: string, status: PackageStatus, trackingNumber?: string) {
    const existing = await prisma.orderPackage.findFirst({
      where: { id: packageId, sellerId }
    });

    if (!existing) throw new Error('PACKAGE_NOT_FOUND_OR_ACCESS_DENIED');

    const pkg = await prisma.orderPackage.update({
      where: { id: packageId },
      data: { 
        status,
        trackingNumber: trackingNumber || undefined
      },
      include: { order: { include: { packages: true } } }
    });

    await publishEvent('package.status_updated', { packageId, status });

    // Sync parent order status if all packages are in a certain state
    await this.syncOrderWithPackages(pkg.orderId);

    return pkg;
  },

  async syncOrderWithPackages(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { packages: true }
    });

    if (!order) return;

    const statuses = order.packages.map(p => p.status);

    // If all packages are SHIPPED, set order to SHIPPED
    if (statuses.every(s => s === 'IN_TRANSIT' || s === 'OUT_FOR_DELIVERY' || s === 'DELIVERED')) {
      if (order.status !== 'SHIPPED') {
        await prisma.order.update({ where: { id: orderId }, data: { status: 'SHIPPED' } });
      }
    }

    // If all packages are DELIVERED, set order to DELIVERED
    if (statuses.every(s => s === 'DELIVERED')) {
      if (order.status !== 'DELIVERED') {
        await prisma.order.update({ where: { id: orderId }, data: { status: 'DELIVERED' } });
      }
    }
  }
};
