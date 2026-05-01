import { prisma, Decimal } from '@ecom/db'

export const promoService = {
  async validateCoupon(code: string, userId?: string, orderTotal?: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: { promotion: true }
    });

    if (!coupon) throw new Error('COUPON_NOT_FOUND');
    
    const promo = coupon.promotion;

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('COUPON_EXHAUSTED');
    }

    return promo;
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
