import { prisma } from '@ecom/db'
import { inventoryService } from '../../inventory/services/inventory-service.js'
import { promoService } from '../../promo/services/promo-service.js'

const productVariantService = prisma.productVariant;
const cartItemService = prisma.cartItem;

export const cartService = {
  // Prisma delegates
  findUnique: prisma.cart.findUnique,
  findFirst: prisma.cart.findFirst,
  findMany: prisma.cart.findMany,
  create: prisma.cart.create,
  update: prisma.cart.update,
  delete: prisma.cart.delete,
  count: prisma.cart.count,
  upsert: prisma.cart.upsert,
  async getCart(sessionId: string, userId?: string) {
    // 1. Safety check: Prisma upsert requires at least one unique identifier
    if (!sessionId && !userId) {
      console.warn('[CartService] getCart called without sessionId or userId');
      throw new Error('MISSING_CART_IDENTIFIER');
    }

    // 2. If userId is provided, prioritize finding the user's primary cart
    if (userId) {
      const userCart = await cartService.findUnique({
        where: { userId },
        include: { items: { include: { variant: { include: { product: { include: { media: true } } } } } } }
      });
      if (userCart) return userCart;
    }

    // 2. Use upsert to either find the session cart or create it atomically
    // If userId is provided but no userCart was found, this will "claim" the session cart for the user
    return await cartService.upsert({
      where: { sessionId },
      update: userId ? { userId } : {},
      create: { sessionId, userId },
      include: { items: { include: { variant: { include: { product: { include: { media: true } } } } } } }
    });
  },

  async addItem(sessionId: string, variantId: string, quantity: number, userId?: string) {
    const cart = await this.getCart(sessionId, userId);
    
    // 1. Get current price (Price Snapshot requirement)
    const variant = await productVariantService.findUnique({
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
    return cartItemService.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        }
      },
      update: {
        quantity: { increment: quantity },
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
    const item = await cartItemService.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });

    if (!item || (item.cart.sessionId !== sessionId && item.cart.userId !== userId)) {
      throw new Error('UNAUTHORIZED_ACCESS');
    }

    return cartItemService.delete({
      where: { id: cartItemId }
    });
  },

  async updateQuantity(cartItemId: string, quantity: number, sessionId: string, userId?: string) {
    const item = await cartItemService.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });
    
    if (!item) throw new Error('ITEM_NOT_FOUND');

    // Verify ownership
    if (item.cart.sessionId !== sessionId && item.cart.userId !== userId) {
      throw new Error('UNAUTHORIZED_ACCESS');
    }

    // Real-time stock validation
    const available = await inventoryService.syncStockFromDB(item.variantId);
    if (available < quantity) throw new Error('INSUFFICIENT_STOCK');

    return cartItemService.update({
      where: { id: cartItemId },
      data: { quantity }
    });
  },

  async mergeCart(guestSessionId: string, userId: string) {
    const guestCart = await cartService.findUnique({
      where: { sessionId: guestSessionId },
      include: { items: true }
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getCart(guestSessionId, userId);

    if (guestCart.id === userCart.id) {
      console.log(`[CartMerge] Guest cart ${guestCart.id} is already the user cart, skipping merge.`);
      return;
    }

    for (const item of guestCart.items) {
      await cartItemService.upsert({
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

    // Clean up guest cart only if it's different from user cart
    await cartService.delete({ where: { id: guestCart.id } });
  }
};
