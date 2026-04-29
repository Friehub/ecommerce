import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { paymentService } from "../services/payment-service";

export const paymentRouter = createTRPCRouter({
  initializePaystack: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await paymentService.initializePaystack(
        input.orderId,
        ctx.session.user.email!,
        input.amount
      );
    }),

  payWithWallet: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await paymentService.payWithWallet(
        ctx.session.user.id,
        input.orderId,
        input.amount
      );
    }),

  getWallet: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.wallet.findUnique({
      where: { userId: ctx.session.user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
    });
  }),
});
