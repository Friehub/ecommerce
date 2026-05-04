import { prisma, Decimal, OrderStatus } from '@ecom/db';
import { publishEvent, queues } from '@ecom/shared';
import { inventoryService } from '../../../inventory/services/inventory-service';

export class OrderOrchestrator {
  /**
   * Complex orchestration for creating an order from a cart.
   * Enforces atomicity across order creation, stock reservation, and cart clearing.
   */
  async createFromCart(userId: string, cartId: string, paymentMethod: string, addressId: string, referralLinkId?: string, idempotencyKey?: string) {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;
    }

    // 2. Fetch & Validate Cart
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { variant: true } } }
    });

    if (!cart || cart.items.length === 0) throw new Error('CART_EMPTY');

    // 3. Prepare Order Data (Grouping by Seller)
    const { itemsBySeller, subtotal } = this.groupItemsBySeller(cart.items);

    // 4. Atomic Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          paymentMethod,
          subtotal,
          idempotencyKey,
          shippingFee: 500,
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

      // 5. Reserve Stock (DIP: delegated to inventory service)
      for (const item of cart.items) {
        const reserved = await inventoryService.reserveStock(item.variantId, item.quantity, newOrder.id, userId, tx);
        if (!reserved) throw new Error(`STOCK_EXHAUSTED:${item.variantId}`);
      }

      // 6. Clear Cart
      await tx.cartItem.deleteMany({ where: { cartId } });

      return newOrder;
    });

    return order;
  }

  /**
   * Helper: Group items by seller for multi-package orders (DRY)
   */
  private groupItemsBySeller(items: any[]) {
    const itemsBySeller: Record<string, any[]> = {};
    let subtotal = new Decimal(0);

    for (const item of items) {
      if (!itemsBySeller[item.sellerId]) itemsBySeller[item.sellerId] = [];
      itemsBySeller[item.sellerId].push(item);
      subtotal = subtotal.add(item.priceSnapshot.mul(item.quantity));
    }

    return { itemsBySeller, subtotal };
  }
}

export const orderOrchestrator = new OrderOrchestrator();
