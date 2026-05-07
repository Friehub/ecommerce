import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "../../../trpc.js";
import { z } from "zod";
import { prisma } from "@ecom/db";
import { reviewService } from "../services/review-service.js";

const _reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      productId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string(),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await reviewService.createReview(
        ctx.session.user.id,
        input.productId,
        input.rating,
        input.comment,
        input.images
      );
    }),

  getByProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return await reviewService.getProductReviews(input.productId);
    }),

  moderate: adminProcedure
    .input(z.object({
      reviewId: z.string(),
      status: z.enum(['APPROVED', 'REJECTED']),
    }))
    .mutation(async ({ input }) => {
      return await reviewService.moderateReview(input.reviewId, input.status);
    }),

  getRatingStats: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return await reviewService.getProductRatingStats(input.productId);
    }),

  listMyReviews: protectedProcedure
    .query(async ({ ctx }) => {
      return await reviewService.getUserReviews(ctx.session.user.id);
    }),

  getPendingReviews: protectedProcedure
    .query(async ({ ctx }) => {
      // Find all delivered items for this user that don't have a review from this user
      const deliveredItems = await prisma.orderLine.findMany({
        where: {
          package: {
            order: { userId: ctx.session.user.id, status: 'DELIVERED' },
          },
          isReturned: false,
          // B12: Filter out items already reviewed by this user
          variant: {
            product: {
              reviews: {
                none: { userId: ctx.session.user.id }
              }
            }
          }
        },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  media: true
                }
              }
            }
          }
        }
      });

      return deliveredItems;
    }),
});

export const reviewRouter = _reviewRouter as any;
export type ReviewRouter = typeof _reviewRouter;
