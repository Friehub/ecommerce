import { prisma } from '@ecom/db'
import { inventoryService } from '../../inventory/services/inventory-service'
import { promoService } from '../../promo/services/promo-service'

export const cartService = {
  async getCart(sessionId: string, userId?: string) {
    // 1. If userId is provided, prioritize finding the user's primary cart
    if (userId) {
      const userCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { variant: { include: { product: true } } } } }
      });
      if (userCart) return userCart;
    }

    // 2. Use upsert to either find the session cart or create it atomically
    // If userId is provided but no userCart was found, this will "claim" the session cart for the user
    return await prisma.cart.upsert({
      where: { sessionId },
      update: userId ? { userId } : {},
      create: { sessionId, userId },
      include: { items: { include: { variant: { include: { product: true } } } } }
    });
  },

  async addItem(sessionId: string, variantId: string, quantity: number, userId?: string) {
    const cart = await this.getCart(sessionId, userId);
    
    // 0. Enforce Cart Limits
    if (cart.items.length >= 50) throw new Error('CART_LIMIT_REACHED');
    if (quantity > 100) throw new Error('MAX_QTY_EXCEEDED');

    // 1. Get current price (Price Snapshot requirement)
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) throw new Error('VARIANT_NOT_FOUND');

    // 2. Real-time stock validation
    const available = await inventoryService.syncStockFromDB(variantId);
    if (available < quantity) throw new Error('INSUFFICIENT_STOCK');

    // 3. Check for Flash Sale price
    const flashSale = await promoService.getFlashSaleForVariant(variantId);
    const finalPrice = flashSale ? flashSale.salePrice : variant.price;

    // 4. Upsert item with price snapshot
    return prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        }
      },
      update: {
        quantity: { increment: Math.min(quantity, 100) },
        priceSnapshot: finalPrice, // Refresh snapshot
      },
      create: {
        cartId: cart.id,
        variantId,
        sellerId: variant.product.sellerId,
        quantity,
        priceSnapshot: finalPrice,
      }
    });
  },

  async removeItem(cartItemId: string, sessionId: string, userId?: string) {
    // Verify ownership
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });

    if (!item || (item.cart.sessionId !== sessionId && item.cart.userId !== userId)) {
      throw new Error('UNAUTHORIZED_ACCESS');
    }

    return prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  },

  async updateQuantity(cartItemId: string, quantity: number, sessionId: string, userId?: string) {
    if (quantity > 100) throw new Error('MAX_QTY_EXCEEDED');

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, variant: true }
    });
    
    if (!item) throw new Error('ITEM_NOT_FOUND');

    // Verify ownership
    if (item.cart.sessionId !== sessionId && item.cart.userId !== userId) {
      throw new Error('UNAUTHORIZED_ACCESS');
    }

    // Real-time stock validation
    const available = await inventoryService.syncStockFromDB(item.variantId);
    if (available < quantity) throw new Error('INSUFFICIENT_STOCK');

    // Refresh Price Snapshot (Logic improvement for production)
    const flashSale = await promoService.getFlashSaleForVariant(item.variantId);
    const finalPrice = flashSale ? flashSale.salePrice : item.variant.price;

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { 
        quantity,
        priceSnapshot: finalPrice
      }
    });
  },

  async mergeCart(guestSessionId: string, userId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId: guestSessionId },
      include: { items: true }
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getCart(guestSessionId, userId);

    await prisma.$transaction(async (tx) => {
      // 1. Get existing user cart items for merging
      const existingUserItems = await tx.cartItem.findMany({
        where: { cartId: userCart.id }
      });

      // 2. Map for quick lookup
      const userItemMap = new Map(existingUserItems.map(item => [item.variantId, item]));

      // 3. Prepare merged data
      const itemsToUpsert = guestCart.items.map(guestItem => {
        const existing = userItemMap.get(guestItem.variantId);
        if (existing) {
          return {
            variantId: guestItem.variantId,
            quantity: Math.min(existing.quantity + guestItem.quantity, 100),
            priceSnapshot: guestItem.priceSnapshot, // Take latest price
            sellerId: guestItem.sellerId
          };
        }
        return {
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
          priceSnapshot: guestItem.priceSnapshot,
          sellerId: guestItem.sellerId
        };
      });

      // 4. Batch Operations
      // Delete existing to replace with merged (Cleanest way to "bulk upsert" logic in Prisma)
      await tx.cartItem.deleteMany({
        where: { 
          cartId: userCart.id,
          variantId: { in: itemsToUpsert.map(i => i.variantId) }
        }
      });

      await tx.cartItem.createMany({
        data: itemsToUpsert.map(item => ({
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          sellerId: item.sellerId
        }))
      });

      // 5. Cleanup guest cart
      await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      await tx.cart.delete({ where: { id: guestCart.id } });
    });
  }

};
