import { createTRPCRouter, publicProcedure, protectedProcedure, rateLimitProcedure } from "../../../trpc";
import { z } from "zod";
import { registerSchema, addressSchema, sellerOnboardingSchema } from "../schemas";
import { userService } from "../services/user-service";
import { sellerService } from "../services/seller-service";
import { TRPCError } from "@trpc/server";

const _iamRouter = createTRPCRouter({
  register: rateLimitProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        return await userService.register(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return await userService.findById(ctx.session.user.id);
  }),

  addAddress: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      return await userService.addAddress(ctx.session.user.id, input);
    }),

  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    return await userService.getAddresses(ctx.session.user.id);
  }),

  onboardSeller: rateLimitProcedure
    .use(({ ctx, next }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return next();
    })
    .input(sellerOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await sellerService.onboard(ctx.session.user.id, input as any);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),
});

export const iamRouter = _iamRouter as any;
export type IamRouter = typeof _iamRouter;
