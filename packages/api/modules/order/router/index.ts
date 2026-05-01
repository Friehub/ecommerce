import { createTRPCRouter, protectedProcedure, sellerProcedure } from "../../../trpc";
import { prisma, PackageStatus } from "@ecom/db";
import { z } from "zod";
import { orderService } from "../services/order-service";
import { packageService } from "../services/package-service";

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      cartId: z.string(),
      paymentMethod: z.string(), // Loosen for different providers
      addressId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await orderService.createFromCart(ctx.session.user.id, input.cartId, input.paymentMethod, input.addressId);
    }),

  get: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await orderService.getOrder(input.orderId, ctx.session.user.id);
    }),

  listMyOrders: protectedProcedure.query(async ({ ctx }) => {
    return await orderService.listUserOrders(ctx.session.user.id);
  }),

  listSellerPackages: sellerProcedure.query(async ({ ctx }) => {
    return await orderService.listSellerPackages(ctx.session.user.id);
  }),

  updatePackageStatus: sellerProcedure
    .input(z.object({
      packageId: z.string(),
      status: z.nativeEnum(PackageStatus),
      trackingNumber: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await packageService.updateStatus(input.packageId, input.status, input.trackingNumber);
    }),
});
