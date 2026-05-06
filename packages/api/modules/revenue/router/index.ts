import { createTRPCRouter, sellerProcedure, adminProcedure } from "../../../trpc.js";
import { z } from "zod";
import { revenueService } from "../services/revenue-service.js";
import { prisma } from "@ecom/db";

const _revenueRouter = createTRPCRouter({
  requestPayout: sellerProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new Error('NOT_A_SELLER');
      return await revenueService.requestPayout(seller.id, input.amount);
    }),

  listMyPayouts: sellerProcedure.query(async ({ ctx }) => {
    const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
    if (!seller) throw new Error('NOT_A_SELLER');
    return await prisma.payout.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' }
    });
  }),

  getMyStats: sellerProcedure.query(async ({ ctx }) => {
    const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
    if (!seller) throw new Error('NOT_A_SELLER');
    return await revenueService.getSellerStats(seller.id);
  }),

  approvePayout: adminProcedure
    .input(z.object({ payoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await revenueService.approvePayout(input.payoutId, ctx.session.user.id);
    }),

  listPendingPayouts: adminProcedure.query(async () => {
    return await prisma.payout.findMany({
      where: { status: 'PENDING' },
      include: { seller: true }
    });
  }),

  listAllPayouts: adminProcedure.query(async () => {
    return await prisma.payout.findMany({
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }),
});

export const revenueRouter = _revenueRouter as any;
export type RevenueRouter = typeof _revenueRouter;
