import { prisma } from '@ecom/db'
import { inventoryService } from '../../inventory/services/inventory-service'

export const cartService = {
  async getCart(sessionId: string, userId?: string) {
    let cart = await prisma.cart.findUnique({
      where: userId ? { userId_sessionId: { userId, sessionId } } : { sessionId },
      include: { 
        items: { 
          include: { variant: { include: { product: true } } } 
        } 
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId, userId },
        include: { items: { include: { variant: { include: { product: true } } } } }
      });
    }

    return cart;
  },

  async addItem(sessionId: string, variantId: string, quantity: number, userId?: string) {
    const cart = await this.getCart(sessionId, userId);
    
    // 1. Get current price (Price Snapshot requirement)
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) throw new Error('VARIANT_NOT_FOUND');

    // 2. Real-time stock validation
    const available = await inventoryService.syncStockFromDB(variantId);
    if (available < quantity) throw new Error('INSUFFICIENT_STOCK');

    // 3. Upsert item with price snapshot
    return prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        }
      },
      update: {
        quantity: { increment: quantity },
        priceSnapshot: variant.price, // Refresh snapshot
      },
      create: {
        cartId: cart.id,
        variantId,
        sellerId: variant.product.sellerId,
        quantity,
        priceSnapshot: variant.price,
      }
    });
  },

  async removeItem(cartItemId: string) {
    return prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  },

  async updateQuantity(cartItemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });
    
    if (!item) throw new Error('ITEM_NOT_FOUND');

    // Real-time stock validation
    const available = await inventoryService.syncStockFromDB(item.variantId);
    if (available < quantity) throw new Error('INSUFFICIENT_STOCK');

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
  },

  async mergeCart(guestSessionId: string, userId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId: guestSessionId },
      include: { items: true }
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getCart(guestSessionId, userId);

    for (const item of guestCart.items) {
      await prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: item.variantId,
          }
        },
        update: {
          quantity: { increment: item.quantity },
          priceSnapshot: item.priceSnapshot,
        },
        create: {
          cartId: userCart.id,
          variantId: item.variantId,
          sellerId: item.sellerId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
        }
      });
    }

    // Clean up guest cart
    await prisma.cart.delete({ where: { id: guestCart.id } });
  }
};
