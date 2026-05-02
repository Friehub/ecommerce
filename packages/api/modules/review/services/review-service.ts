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

    // 2. Create review
    const review = await prisma.review.create({
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
    try {
      // Aggregate for Product
      const productStats = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { _all: true }
      });

      await prisma.product.update({
        where: { id: productId },
        data: {
          averageRating: productStats._avg.rating || 0,
          reviewCount: productStats._count._all
        }
      });

      // Aggregate for Seller
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true }
      });

      if (product) {
        const sellerStats = await prisma.review.aggregate({
          where: { product: { sellerId: product.sellerId } },
          _avg: { rating: true }
        });

        await prisma.seller.update({
          where: { id: product.sellerId },
          data: { rating: sellerStats._avg.rating || 0 }
        });
      }
    } catch (err: any) {
      console.warn('Failed to update ratings:', err.message);
    }

    return review;
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
