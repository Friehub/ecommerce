import { createTRPCRouter, publicProcedure } from "../../../trpc";
import { z } from "zod";
import { promoService } from "../services/promo-service";

export const promoRouter = createTRPCRouter({
  validateCoupon: publicProcedure
    .input(z.object({
      code: z.string(),
      orderTotal: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await promoService.validateCoupon(
        input.code,
        ctx.session?.user?.id,
        input.orderTotal
      );
    }),

  getFlashSales: publicProcedure.query(async () => {
    return await promoService.getActiveFlashSales();
  }),
});
