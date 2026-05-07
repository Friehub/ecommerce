import { createTRPCRouter, protectedProcedure } from "../../../trpc.js";
import { TRPCError } from "@trpc/server";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { paymentService } from "../services/payment-service.js";

const _paymentRouter = createTRPCRouter({
  initializePaystack: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId, userId: ctx.session.user.id }
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });

      return await paymentService.initializePaystack(
        input.orderId,
        ctx.session.user.id,
        ctx.session.user.email!,
        Number(order.total)
      );
    }),

  payWithWallet: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId, userId: ctx.session.user.id }
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });

      return await paymentService.payWithWallet(
        ctx.session.user.id,
        input.orderId,
        Number(order.total)
      );
    }),

  getWallet: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.wallet.findUnique({
      where: { userId: ctx.session.user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
    });
  }),
});

export const paymentRouter = _paymentRouter;
export type PaymentRouter = typeof _paymentRouter;
