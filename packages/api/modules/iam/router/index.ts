import { createTRPCRouter, publicProcedure, protectedProcedure, rateLimitProcedure } from "../../../trpc.js";
import { z } from "zod";
import { registerSchema, addressSchema, sellerOnboardingSchema } from "../schemas/index.js";
import { userService } from "../services/user-service.js";
import { sellerService } from "../services/seller-service.js";
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

  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      phone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await userService.updateProfile(ctx.session.user.id, input);
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
        return await sellerService.onboard(ctx.session!.user.id, input as any);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  setupPayoutAccount: protectedProcedure
    .input(z.object({
      bankCode: z.string(),
      bankAccountNumber: z.string(),
      bankAccountName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await sellerService.setupPayoutAccount(ctx.session.user.id, input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),

  deleteAddress: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await userService.deleteAddress(input.id, ctx.session.user.id);
    }),
});

export const iamRouter = _iamRouter;
export type IamRouter = typeof _iamRouter;
