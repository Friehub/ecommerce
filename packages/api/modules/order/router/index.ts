import { createTRPCRouter, protectedProcedure, sellerProcedure } from "../../../trpc.js";
import { TRPCError } from "@trpc/server";
import { prisma, PackageStatus } from "@ecom/db";
import { z } from "zod";
import { orderService } from "../services/order-service.js";
import { packageService } from "../services/package-service.js";

const _orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      cartId: z.string(),
      paymentMethod: z.string(), // Loosen for different providers
      addressId: z.string(),
      referralLinkId: z.string().optional(),
      couponCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await orderService.createFromCart(
        ctx.session.user.id, 
        input.cartId, 
        input.paymentMethod, 
        input.addressId,
        input.referralLinkId,
        input.couponCode
      );
    }),

  get: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await orderService.getOrder(input.orderId, ctx.session.user.id);
    }),

  listMyOrders: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      return await orderService.listUserOrders(ctx.session.user.id, input.limit, input.offset);
    }),

  listSellerPackages: sellerProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: "UNAUTHORIZED", message: "Seller account not found" });
      
      return await orderService.listSellerPackages(seller.id, input.limit, input.offset);
    }),

  updatePackageStatus: sellerProcedure
    .input(z.object({
      packageId: z.string(),
      status: z.nativeEnum(PackageStatus),
      trackingNumber: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: "UNAUTHORIZED", message: "Seller account not found" });

      // Ownership check (C05)
      const pkg = await prisma.orderPackage.findFirst({
        where: { id: input.packageId, sellerId: seller.id }
      });
      if (!pkg) throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this package" });

      return await packageService.updateStatus(input.packageId, input.status, input.trackingNumber);
    }),

  cancel: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await orderService.cancelOrder(input.orderId, ctx.session.user.id);
    }),
});

export const orderRouter = _orderRouter as any;
export type OrderRouter = typeof _orderRouter;
