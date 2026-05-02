import { prisma, Decimal, OrderStatus } from '@ecom/db'
import { publishEvent, queues } from '@ecom/shared'
import { inventoryService } from '../../inventory/services/inventory-service'
import { ledgerService } from '../../revenue/services/ledger-service'

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
  async createFromCart(userId: string, cartId: string, paymentMethod: string, addressId: string, referralLinkId?: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { variant: true } } }
    });

    if (!cart || cart.items.length === 0) throw new Error('CART_EMPTY');

    // 1. Group items by seller
    const itemsBySeller: Record<string, typeof cart.items> = {};
    let subtotal = new Decimal(0);

    for (const item of cart.items) {
      if (!itemsBySeller[item.sellerId]) itemsBySeller[item.sellerId] = [];
      itemsBySeller[item.sellerId].push(item);
      subtotal = subtotal.add(item.priceSnapshot.mul(item.quantity));
    }

    // 2. Create Order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          paymentMethod,
          subtotal,
          shippingFee: 500, // Fixed for contest demo
          discount: 0,
          total: subtotal.add(500),
          status: 'PENDING_PAYMENT',
          packages: {
            create: Object.entries(itemsBySeller).map(([sellerId, items]) => ({
              sellerId,
              status: 'PENDING',
              lines: {
                create: items.map(item => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  unitPrice: item.priceSnapshot,
                }))
              }
            }))
          }
        },
        include: { packages: { include: { lines: true } } }
      });

      // 3. Reserve stock for all items
      for (const item of cart.items) {
        const reserved = await inventoryService.reserveStock(item.variantId, item.quantity, newOrder.id, userId, tx);
        if (!reserved) throw new Error(`STOCK_EXHAUSTED:${item.variantId}`);
      }

      // 4. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      // 5. Record Affiliate Commission if referral exists
      if (referralLinkId) {
        const { affiliateService } = await import('../../affiliate/services/affiliate-service');
        const link = await tx.referralLink.findUnique({
          where: { id: referralLinkId }
        });
        
        if (link) {
          await affiliateService.recordCommission(link.agentId, newOrder.id, newOrder.total.toNumber());
        }
      }

      return newOrder;
    });

    // 6. Fire event
    await publishEvent('order.created', { 
      orderId: order.id, 
      userId, 
      total: order.total.toNumber() 
    });

    if (paymentMethod === 'POD' || paymentMethod === 'PAY_ON_DELIVERY') {
      await orderService.updateStatus(order.id, 'PROCESSING');
    } else {
      // 7. Schedule SLA check (Cancel if not paid in 30 mins)
      await queues.orderQueue.add('sla-payment-timeout', { orderId: order.id }, { delay: 30 * 60 * 1000 });
    }

    return order;
  },

  async updateStatus(orderId: string, status: OrderStatus, tx?: any) {
    const db = tx || prisma;
    const currentOrder = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) throw new Error('ORDER_NOT_FOUND');

    // Enforce state machine
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

    // Side effects
    if (status === 'PAID') {
      await inventoryService.confirmStock(orderId);
      
      // Record sales in ledger (Pending)
      for (const pkg of order.packages) {
        const lines = await db.orderLine.findMany({ where: { packageId: pkg.id } });
        for (const line of lines) {
          await ledgerService.recordSale(line.id);
        }
        await publishEvent('package.pending_confirmation', { packageId: pkg.id, sellerId: pkg.sellerId });
      }
    }

    if (status === 'CANCELLED') {
      await inventoryService.releaseStockByOrderId(orderId, tx);
      await publishEvent('order.cancelled', { orderId, reason: 'Manual update' });
    }

    if (status === 'DELIVERED') {
      // Set release date for ledger entries (7-day window)
      await ledgerService.scheduleEscrowRelease(orderId);
      
      // Start 7-day escrow timer job in background
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

  async listUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async listSellerPackages(sellerId: string) {
    return prisma.orderPackage.findMany({
      where: { sellerId },
      include: { 
        order: true,
        lines: { include: { variant: { include: { product: true } } } } 
      },
      orderBy: { order: { createdAt: 'desc' } }
    });
  }
};
