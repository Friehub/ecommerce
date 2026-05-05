import { prisma, PackageStatus, OrderStatus } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import { orderService } from './order-service'

export const packageService = {
  async updateStatus(packageId: string, status: PackageStatus, trackingNumber?: string) {
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

    // If any package is READY_FOR_PICKUP or further, the order should be at least PROCESSING
    if (statuses.some(s => s !== 'PENDING' && s !== 'CANCELLED')) {
      if (order.status === 'PAID') {
        await orderService.updateStatus(orderId, 'PROCESSING');
      }
    }

    // If all packages are SHIPPED (or later), set order to SHIPPED
    const shippedStatuses: PackageStatus[] = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (statuses.every(s => s === 'CANCELLED' || shippedStatuses.includes(s))) {
      const activePackages = statuses.filter(s => s !== 'CANCELLED');
      if (activePackages.length > 0 && activePackages.every(s => shippedStatuses.includes(s))) {
        if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
          await orderService.updateStatus(orderId, 'SHIPPED');
        }
      }
    }

    // If all non-cancelled packages are DELIVERED, set order to DELIVERED
    if (statuses.every(s => s === 'DELIVERED' || s === 'CANCELLED')) {
      const activePackages = statuses.filter(s => s !== 'CANCELLED');
      if (activePackages.length > 0 && activePackages.every(s => s === 'DELIVERED')) {
        if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
          await orderService.updateStatus(orderId, 'DELIVERED');
        }
      }
    }
  }
};
