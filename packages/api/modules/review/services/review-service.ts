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

    // 2. Automated Sentiment Analysis (Rust Client)
    let sentimentData = { score: 0.5, label: 'NEUTRAL', keywords: [] as string[] };
    try {
      const { RustClient } = await import('../../../rust-client.js');
      const analysis = await RustClient.analysis.sentiment(comment);
      sentimentData = {
        score: analysis.score,
        label: analysis.label,
        keywords: analysis.keywords
      };
    } catch (e) {
      console.warn('Sentiment analysis failed:', e);
    }

    // 3. Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        sentimentScore: sentimentData.score,
        sentiment: sentimentData.label,
        keywords: sentimentData.keywords,
        status: 'PENDING', // All reviews go through moderation, preventing auto-rejection bias
        media: {
          create: images.map(url => ({ url }))
        }
      }
    });

    // 3. Recalculate ratings (B12: Optimized & Separate handlers)
    try {
      const productStats = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { _all: true }
      });

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          averageRating: productStats._avg.rating || 0,
          reviewCount: productStats._count._all
        },
        select: { sellerId: true } // B12: Get sellerId without extra query
      });

      // Aggregate for Seller in a separate block to avoid masking failures
      try {
        const sellerStats = await prisma.review.aggregate({
          where: { product: { sellerId: updatedProduct.sellerId } },
          _avg: { rating: true }
        });

        await prisma.seller.update({
          where: { id: updatedProduct.sellerId },
          data: { rating: sellerStats._avg.rating || 0 }
        });
      } catch (sellerErr: any) {
        console.error(`Failed to update seller rating for ${updatedProduct.sellerId}:`, sellerErr.message);
      }

    } catch (productErr: any) {
      console.error(`Failed to update product rating for ${productId}:`, productErr.message);
    }

    return review;
  },

  async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId, status: 'APPROVED' }, // Only show approved reviews to public
      include: { 
        user: { select: { firstName: true, lastName: true } },
        media: true 
      },
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
  },

  async getUserReviews(userId: string) {
    return prisma.review.findMany({
      where: { userId },
      include: { 
        product: { include: { media: true } },
        media: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
