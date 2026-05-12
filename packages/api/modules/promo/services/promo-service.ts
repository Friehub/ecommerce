import { prisma, Decimal } from '@ecom/db'

export const promoService = {
  async validateCoupon(code: string, userId?: string, orderTotal?: number) {
    const coupon = await prisma.coupon.findUnique({
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
      const cart = await prisma.cart.findFirst({
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
      const userRedemptions = await prisma.couponRedemption.count({
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
    return prisma.flashSale.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: { variant: { include: { product: true } } }
    });
  },

  async getFlashSaleForVariant(variantId: string) {
    const now = new Date();
    return prisma.flashSale.findFirst({
      where: {
        variantId,
        startTime: { lte: now },
        endTime: { gte: now },
      }
    });
  }
};
