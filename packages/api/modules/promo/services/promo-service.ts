import { prisma, Decimal } from '@ecom/db'

export const promoService = {
  async validateCoupon(code: string, userId?: string, orderTotal?: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: { promotion: true }
    });

    if (!coupon) throw new Error('COUPON_NOT_FOUND');
    
    const promo = coupon.promotion;
    
    // 1. Check expiration (if we add dates later)
    // 2. Check min order
    if (orderTotal && new Decimal(orderTotal).lt(promo.minOrder)) {
      throw new Error('MIN_ORDER_NOT_MET');
    }

    // 3. Check usage limit
    if (promo.maxUses) {
      const usedCount = await prisma.coupon.count({
        where: { promotionId: promo.id, usedByUserId: { not: null } }
      });
      if (usedCount >= promo.maxUses) throw new Error('COUPON_EXHAUSTED');
    }

    // 4. Check if single use by this user
    if (coupon.isSingleUse && coupon.usedByUserId) {
       throw new Error('COUPON_ALREADY_USED');
    }

    return promo;
  },

  async getActiveFlashSales() {
    const now = new Date();
    return prisma.flashSale.findMany({
      where: {
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: { variant: { include: { product: true } } }
    });
  },

  async getFlashSaleForVariant(variantId: string) {
    const now = new Date();
    return prisma.flashSale.findFirst({
      where: {
        variantId,
        startAt: { lte: now },
        endAt: { gte: now },
      }
    });
  }
};
