import { prisma, Decimal, OrderStatus } from '@ecom/db'
import { publishEvent, queues } from '@ecom/shared'
import { inventoryService } from '../../inventory/services/inventory-service.js'
import { ledgerService } from '../../revenue/services/ledger-service.js'

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
  FRAUD_REVIEW: ['PAID', 'CANCELLED', 'PROCESSING']
};

import { promoService } from '../../promo/services/promo-service.js';

export const orderService = {
  async createFromCart(userId: string, cartId: string, paymentMethod: string, addressId: string, referralLinkId?: string, couponCode?: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { variant: true } } }
    });

    if (!cart || cart.items.length === 0) throw new Error('CART_EMPTY');

    // Fix BUG-005: Verify address ownership
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId }
    });
    if (!address) throw new Error('ADDRESS_NOT_FOUND_OR_UNAUTHORIZED');

    // 1. Group items by (sellerId, warehouseId) for package splitting (C16)
    // First, pre-fetch stock availability to determine warehouses
    const fulfillmentGroups: Record<string, { sellerId: string, warehouseId: string, items: any[] }> = {};
    let subtotal = new Decimal(0);

    for (const item of cart.items) {
      // Find the best warehouse (one with enough stock)
      const stockLevel = await prisma.stockLevel.findFirst({
        where: { 
          variantId: item.variantId, 
          sellerId: item.sellerId, 
          qtyOnHand: { gte: item.quantity } 
        }
      });

      if (!stockLevel) throw new Error(`STOCK_EXHAUSTED:${item.variantId}`);

      const groupKey = `${item.sellerId}:${stockLevel.warehouseId}`;
      if (!fulfillmentGroups[groupKey]) {
        fulfillmentGroups[groupKey] = { 
          sellerId: item.sellerId, 
          warehouseId: stockLevel.warehouseId, 
          items: [] 
        };
      }
      fulfillmentGroups[groupKey].items.push({ ...item, warehouseId: stockLevel.warehouseId });
      subtotal = subtotal.add(item.variant.price.mul(item.quantity));
    }

    // 2. Create Order
    const order = await prisma.$transaction(async (tx) => {
      let discount = new Decimal(0);
      if (couponCode) {
        const promo = await promoService.validateCoupon(couponCode, userId, subtotal.toNumber());
        if (promo.type === 'PERCENTAGE') {
          discount = subtotal.mul(promo.value.div(100));
        } else if (promo.type === 'FIXED_AMOUNT') {
          discount = promo.value;
        }
        await promoService.markCouponUsed(couponCode, tx);
      }

      const { logisticsService } = await import('../../logistics/services/logistics-service.js');
      const shippingItems = cart.items.map(i => ({ 
        weightGrams: i.variant.weightGrams || 500, 
        quantity: i.quantity 
      }));
      const shipping = await logisticsService.calculateShipping(userId, '', addressId, shippingItems);
      const shippingFee = new Decimal(shipping.total);

      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          paymentMethod,
          subtotal,
          shippingFee,
          discount,
          total: subtotal.add(shippingFee).sub(discount),
          status: 'PENDING_PAYMENT',
          packages: {
            create: Object.values(fulfillmentGroups).map(group => ({
              sellerId: group.sellerId,
              warehouseId: group.warehouseId,
              status: 'PENDING',
              lines: {
                create: group.items.map(item => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  unitPrice: item.variant.price,
                }))
              }
            }))
          }
        },
        include: { packages: { include: { lines: true } } }
      });

      // 3. Reserve stock for all items
      const now = new Date();
      for (const group of Object.values(fulfillmentGroups)) {
        for (const item of group.items) {
          // Flash Sale logic
          const flashSale = await tx.flashSale.findFirst({
            where: {
              variantId: item.variantId,
              startTime: { lte: now },
              endTime: { gte: now }
            }
          });

          if (flashSale) {
            const result = await tx.flashSale.updateMany({
              where: {
                id: flashSale.id,
                qtySold: { lte: flashSale.qtyLimit - item.quantity }
              },
              data: { qtySold: { increment: item.quantity } }
            });
            if (result.count === 0) throw new Error(`FLASH_SALE_EXHAUSTED:${item.variantId}`);
          }

          const reserved = await inventoryService.reserveStock(
            item.variantId, 
            item.quantity, 
            item.sellerId, 
            item.warehouseId, 
            newOrder.id, 
            userId, 
            tx
          );
          if (!reserved) throw new Error(`STOCK_EXHAUSTED:${item.variantId}`);
        }
      }

      // 4. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      return newOrder;
    });

    // 6. Fire event
    await publishEvent('order.created', { 
      orderId: order.id, 
      userId, 
      total: order.total.toNumber(),
      referralLinkId // Pass this for background attribution
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
      await inventoryService.confirmStock(orderId, db);
      
      // Record sales in ledger (Pending)
      for (const pkg of order.packages) {
        const lines = await db.orderLine.findMany({ where: { packageId: pkg.id } });
        for (const line of lines) {
          await ledgerService.recordSale(line.id);
        }
        await publishEvent('package.pending_confirmation', { packageId: pkg.id, sellerId: pkg.sellerId });
      }

      // FraudWorker will now handle the transition to PROCESSING after screening.
      // This prevents suspicious orders from auto-creating shipments immediately.
    }

    if (status === 'CANCELLED') {
      await inventoryService.releaseStockByOrderId(orderId, db);
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

  async listUserOrders(userId: string, limit: number = 20, offset: number = 0) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  async listSellerPackages(sellerId: string, limit: number = 20, offset: number = 0) {
    return prisma.orderPackage.findMany({
      where: { sellerId },
      include: { 
        order: true,
        lines: { include: { variant: { include: { product: true } } } } 
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: limit,
      skip: offset,
    });
  },

  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId }
    });
    if (!order) throw new Error('ORDER_NOT_FOUND');
    
    return await this.updateStatus(orderId, 'CANCELLED');
  }
};
