import { prisma, Decimal } from '@ecom/db'
import type { Service } from '../../../types'

export const promoService: Service = {
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

    return promo;
  },

  async markCouponUsed(code: string, tx?: any) {
    const db = tx || prisma;
    await db.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } }
    });
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
