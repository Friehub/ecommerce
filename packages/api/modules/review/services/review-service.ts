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
    return prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        status: 'PENDING', // Moderation by default
        media: {
          create: images.map(url => ({ url }))
        }
      }
    });
  },

  async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async moderateReview(reviewId: string, status: 'APPROVED' | 'REJECTED') {
    return prisma.review.update({
      where: { id: reviewId },
      data: { status }
    });
  }
};
