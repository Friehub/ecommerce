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

  getPublicProfile: publicProcedure
    .input(z.object({ idOrSlug: z.string() }))
    .query(async ({ input }) => {
      return await sellerService.getPublicProfile(input.idOrSlug);
    }),

  uploadDocument: protectedProcedure
    .input(z.object({
      type: z.enum(['NIN', 'BANK_STATEMENT', 'CAC', 'UTILITY_BILL']),
      url: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.getProfile(ctx.session.user.id);
      if (!seller) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Please complete seller onboarding first",
        });
      }
      return await sellerService.uploadDocument(seller.id, input);
    }),

  requestPhoneOTP: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await userService.requestPhoneOTP(ctx.session.user.id);
    }),

  verifyPhoneOTP: protectedProcedure
    .input(z.object({ otp: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      return await userService.verifyPhoneOTP(ctx.session.user.id, input.otp);
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return await userService.requestPasswordReset(input.email);
    }),

  resetPassword: publicProcedure
    .input(z.object({ 
      token: z.string(), 
      newPassword: z.string().min(8) 
    }))
    .mutation(async ({ input }) => {
      return await userService.resetPassword(input.token, input.newPassword);
    }),

  toggleTwoFactor: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return await userService.toggleTwoFactor(ctx.session.user.id, input.enabled);
    }),
});

export const iamRouter = _iamRouter;
export type IamRouter = typeof _iamRouter;
