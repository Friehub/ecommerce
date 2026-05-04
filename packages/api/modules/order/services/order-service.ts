import { prisma, OrderStatus } from '@ecom/db'
import { publishEvent, queues } from '@ecom/shared'
import { inventoryService } from '../../inventory/services/inventory-service'
import { ledgerService } from '../../revenue/services/ledger-service'
import { orderOrchestrator } from './managers/order-orchestrator'

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED', 'PROCESSING'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED', 'RETURN_REQUESTED'],
  COMPLETED: [],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: [],
  FRAUD_REVIEW: ['PAID', 'CANCELLED']
};

export const orderService = {
  async createFromCart(userId: string, cartId: string, paymentMethod: string, addressId: string, referralLinkId?: string, idempotencyKey?: string) {
    const order = await orderOrchestrator.createFromCart(userId, cartId, paymentMethod, addressId, referralLinkId, idempotencyKey);

    // Side Effects after successful creation
    await publishEvent('order.created', { 
      orderId: order.id, 
      userId, 
      total: (order as any).total.toNumber(),
      referralLinkId
    });

    if (paymentMethod === 'POD' || paymentMethod === 'PAY_ON_DELIVERY') {
      await this.updateStatus(order.id, 'PROCESSING');
    } else {
      await queues.orderQueue.add('sla-payment-timeout', { orderId: order.id }, { delay: 30 * 60 * 1000 });
    }

    return order;
  },

  async updateStatus(orderId: string, status: OrderStatus, tx?: any) {
    const db = tx || prisma;
    const currentOrder = await db.order.findUnique({ where: { id: orderId } });
    if (!currentOrder) throw new Error('ORDER_NOT_FOUND');

    const allowed = ORDER_TRANSITIONS[currentOrder.status as OrderStatus];
    if (!allowed.includes(status)) {
      throw new Error(`INVALID_TRANSITION:${currentOrder.status}->${status}`);
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: { packages: true }
    });

    await publishEvent('order.status_updated', { orderId, status });

    // Status-specific logic (Debloated if it gets larger)
    // Status-specific logic (Debloated if it gets larger)
    if (status === 'PAID') {
      await inventoryService.confirmStock(orderId);
      
      // Batch fetch all line IDs for this order to avoid N+1 in ledger recording
      const allLines = await db.orderLine.findMany({
        where: { package: { orderId } },
        select: { id: true, packageId: true }
      });

      const lineIdsByPackage = allLines.reduce((acc, l) => {
        acc[l.packageId] = (acc[l.packageId] || []).concat(l.id);
        return acc;
      }, {} as Record<string, string[]>);

      await Promise.all(order.packages.map(async (pkg) => {
        const lineIds = lineIdsByPackage[pkg.id] || [];
        if (lineIds.length > 0) await ledgerService.recordBulkSale(lineIds);
        await publishEvent('package.pending_confirmation', { packageId: pkg.id, sellerId: pkg.sellerId });
      }));
    }

    if (status === 'CANCELLED') {
      await inventoryService.releaseStockByOrderId(orderId, tx);
      await publishEvent('order.cancelled', { orderId, reason: 'Manual update' });
    }

    if (status === 'DELIVERED') {
      await ledgerService.scheduleEscrowRelease(orderId);
      await queues.orderQueue.add('escrow-release', { orderId }, { delay: 7 * 24 * 60 * 60 * 1000 });
    }

    return order;
  },

  async getOrder(orderId: string, userId: string) {
    return prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { 
        packages: { 
          include: { 
            lines: { include: { variant: { include: { product: true } } } },
            shipments: { include: { events: { orderBy: { createdAt: 'desc' } } } }
          } 
        }
      }
    });
  },

  async listUserOrders(userId: string, limit: number = 20, offset: number = 0) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  async listSellerPackages(userId: string, limit: number = 20, offset: number = 0) {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new Error('SELLER_NOT_FOUND');

    return prisma.orderPackage.findMany({
      where: { sellerId: seller.id },
      include: { 
        order: true,
        lines: { include: { variant: { include: { product: true } } } } 
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: limit,
      skip: offset,
    });
  }
};
