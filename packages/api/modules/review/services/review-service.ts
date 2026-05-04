import { prisma } from '@ecom/db'

export const reviewService = {
  async createReview(userId: string, productId: string, rating: number, comment: string, images: string[] = []) {
    // 1. Verify user bought and received the product
    const delivered = await prisma.orderPackage.findFirst({
      where: {
        order: { userId },
        status: 'DELIVERED',
        lines: { some: { variant: { productId } } }
      }
    });

    if (!delivered) throw new Error('NOT_ELIGIBLE_TO_REVIEW');

    // 2. Create review and update ratings atomically
    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          productId,
          rating,
          comment,
          media: {
            create: images.map(url => ({ url }))
          }
        }
      });

      // 3. Recalculate ratings
      const productStats = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { _all: true }
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: productStats._avg.rating || 0,
          reviewCount: productStats._count._all
        }
      });

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { sellerId: true }
      });

      if (product) {
        const sellerStats = await tx.review.aggregate({
          where: { product: { sellerId: product.sellerId } },
          _avg: { rating: true }
        });

        await tx.seller.update({
          where: { id: product.sellerId },
          data: { rating: sellerStats._avg.rating || 0 }
        });
      }

      return review;
    });
  },

  async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async moderateReview(reviewId: string, status: 'APPROVED' | 'REJECTED') {
    return prisma.review.update({
      where: { id: reviewId },
      data: { 
        status,
        reviewedAt: new Date()
      }
    });
  },

  async getProductRatingStats(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { averageRating: true, reviewCount: true }
    });
    return product || { averageRating: 0, reviewCount: 0 };
  }
};
