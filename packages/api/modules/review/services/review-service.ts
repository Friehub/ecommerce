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

    // 3. Recalculate seller average rating
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true }
      });

      if (product) {
        const avgResult = await prisma.review.aggregate({
          where: { product: { sellerId: product.sellerId } },
          _avg: { rating: true }
        });

        const newAvg = avgResult._avg.rating || 0;
        await prisma.seller.update({
          where: { id: product.sellerId },
          data: { rating: newAvg }
        });
      }
    } catch (err: any) {
      console.warn('Failed to update seller rating:', err.message);
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
    return prisma.review.findUnique({
      where: { id: reviewId }
    });
  }
};
