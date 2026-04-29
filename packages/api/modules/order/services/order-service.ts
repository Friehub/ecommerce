import { prisma, Decimal } from '@ecom/db'
import { publishEvent, queues } from '@ecom/shared'
import { inventoryService } from '../../inventory/services/inventory-service'

export const orderService = {
  async createFromCart(userId: string, cartId: string, paymentMethod: string) {
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
        const reserved = await inventoryService.reserveStock(item.variantId, item.quantity, newOrder.id);
        if (!reserved) throw new Error(`STOCK_EXHAUSTED:${item.variantId}`);
      }

      // 4. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      return newOrder;
    });

    // 5. Fire event
    await publishEvent('order.created', { orderId: order.id, userId });

    // 6. Schedule SLA check (Cancel if not paid in 30 mins)
    await queues.orderQueue.add('sla-payment-timeout', { orderId: order.id }, { delay: 30 * 60 * 1000 });

    return order;
  },

  async updateStatus(orderId: string, status: any) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { packages: true }
    });

    await publishEvent('order.status_updated', { orderId, status });

    if (status === 'PAID') {
      await inventoryService.confirmStock(orderId);
    }

    return order;
  },

  async getOrder(orderId: string, userId: string) {
    return prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { 
        packages: { 
          include: { 
            lines: { include: { variant: { include: { product: true } } } } 
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
