import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "../../../trpc";
import { z } from "zod";
import { reviewService } from "../services/review-service";

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
});

export const reviewRouter = _reviewRouter as any;
export type ReviewRouter = typeof _reviewRouter;
