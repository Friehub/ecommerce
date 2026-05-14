import { createTRPCRouter, publicProcedure } from "../../../trpc.js";
import { z } from "zod";
import { promoService } from "../services/promo-service.js";

const _promoRouter = createTRPCRouter({
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

export const promoRouter = _promoRouter;
export type PromoRouter = typeof _promoRouter;
