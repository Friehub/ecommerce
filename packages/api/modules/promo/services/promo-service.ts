import { prisma, Decimal } from '@ecom/db'

const couponService = prisma.coupon;
const cartService = prisma.cart;
const couponRedemptionService = prisma.couponRedemption;
const flashSaleService = prisma.flashSale;

export const promoService = {
  // Prisma delegates
  findUnique: prisma.promotion.findUnique,
  findFirst: prisma.promotion.findFirst,
  findMany: prisma.promotion.findMany,
  create: prisma.promotion.create,
  update: prisma.promotion.update,
  delete: prisma.promotion.delete,
  count: prisma.promotion.count,
  async validateCoupon(code: string, userId?: string, orderTotal?: number) {
    const coupon = await couponService.findUnique({
      where: { code },
      include: { promotion: true }
    });

    if (!coupon) throw new Error('COUPON_NOT_FOUND');
    
    const promo = coupon.promotion;

    // Check isActive
    if (!promo.isActive) {
      throw new Error('COUPON_INACTIVE');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('COUPON_EXHAUSTED');
    }

    // Check date window
    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      throw new Error('COUPON_EXPIRED');
    }

    // Check minimum order value (Fix 2.12)
    if (promo.minOrderValue && orderTotal && new Decimal(orderTotal).lt(promo.minOrderValue)) {
      throw new Error('MIN_ORDER_VALUE_NOT_MET');
    }

    // Check seller scoping (C05)
    if (promo.sellerId && userId) {
      const cart = await cartService.findFirst({
        where: { userId },
        include: { items: true }
      });
      
      if (cart) {
        const hasSellerItem = cart.items.some(item => item.sellerId === promo.sellerId);
        if (!hasSellerItem) {
          throw new Error('COUPON_SELLER_MISMATCH');
        }
      }
    }

    // Check per-user limit
    if (promo.usageLimitPerUser && userId) {
      const userRedemptions = await couponRedemptionService.count({
        where: { couponId: coupon.id, userId }
      });
      if (userRedemptions >= promo.usageLimitPerUser) {
        throw new Error('COUPON_USER_LIMIT_EXCEEDED');
      }
    }

    return promo;
  },

  async markCouponUsed(code: string, userId?: string, orderId?: string, tx?: any) {
    const db = tx || prisma;
    const coupon = await db.coupon.findUnique({ where: { code } });
    if (!coupon) return;

    await db.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } }
    });

    if (userId && orderId) {
      await db.couponRedemption.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId
        }
      });
    }
  },

  async getActiveFlashSales() {
    const now = new Date();
    return flashSaleService.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: { variant: { include: { product: true } } }
    });
  },

  async getFlashSaleForVariant(variantId: string) {
    const now = new Date();
    return flashSaleService.findFirst({
      where: {
        variantId,
        startTime: { lte: now },
        endTime: { gte: now },
      }
    });
  }
};
