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

  initializePayment: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      provider: z.enum(['paystack', 'flutterwave', 'monnify'])
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId, userId: ctx.session.user.id }
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });

      return await paymentService.initializeTransaction(
        input.provider,
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

  fundWallet: protectedProcedure
    .input(z.object({
      amount: z.number().min(100),
    }))
    .mutation(async ({ ctx, input }) => {
      return await paymentService.requestWalletFunding(
        ctx.session.user.id,
        ctx.session.user.email!,
        input.amount
      );
    }),

  withdraw: protectedProcedure
    .input(z.object({
      amount: z.number().min(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      return await paymentService.initiateWithdrawal(
        ctx.session.user.id,
        input.amount
      );
    }),

  getWallet: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.wallet.findUnique({
      where: { userId: ctx.session.user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
    });
  }),

  verifyPayment: protectedProcedure
    .input(z.object({
      reference: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payment = await prisma.payment.findFirst({
        where: { providerRef: input.reference, userId: ctx.session.user.id }
      });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment record not found" });

      if (payment.status === 'SUCCESS') return { status: 'SUCCESS' };

      const { getPaymentAdapter } = await import('../adapters/index.js');
      const adapter = getPaymentAdapter('paystack');
      const result = await adapter.verifyTransaction(input.reference);

      if (result.status === 'success') {
        await paymentService.handleWebhook(input.reference, 'success');
        return { status: 'SUCCESS' };
      }

      return { status: result.status.toUpperCase() };
    }),
});

export const paymentRouter = _paymentRouter;
export type PaymentRouter = typeof _paymentRouter;
