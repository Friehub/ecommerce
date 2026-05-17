import { createTRPCRouter, sellerProcedure, adminProcedure } from "../../../trpc.js";
import { z } from "zod";
import { revenueService } from "../services/revenue-service.js";
import { prisma } from "@ecom/db";
import { sellerService } from "../../iam/services/seller-service.js";

const payoutService = prisma.payout;

const _revenueRouter = createTRPCRouter({
  requestPayout: sellerProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new Error('NOT_A_SELLER');
      return await revenueService.requestPayout(seller.id, input.amount);
    }),

  listMyPayouts: sellerProcedure.query(async ({ ctx }) => {
    const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
    if (!seller) throw new Error('NOT_A_SELLER');
    return await payoutService.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' }
    });
  }),

  getMyStats: sellerProcedure.query(async ({ ctx }) => {
    const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
    if (!seller) throw new Error('NOT_A_SELLER');
    return await revenueService.getSellerStats(seller.id);
  }),

  getLedger: sellerProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { ledgerService } = await import('../services/ledger-service.js');
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new Error('NOT_A_SELLER');
      return await ledgerService.getLedger(seller.id, input.limit, input.cursor);
    }),
  
  exportLedger: sellerProcedure.query(async ({ ctx }) => {
    const { ledgerService } = await import('../services/ledger-service.js');
    const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
    if (!seller) throw new Error('NOT_A_SELLER');
    return await ledgerService.exportLedger(seller.id);
  }),

  getPayoutAccount: sellerProcedure.query(async ({ ctx }) => {
    const seller = await sellerService.findUnique({ 
      where: { userId: ctx.session.user.id },
      select: { bankCode: true, bankAccountNumber: true, bankAccountName: true }
    });
    if (!seller) throw new Error('NOT_A_SELLER');
    return seller;
  }),

  updatePayoutAccount: sellerProcedure
    .input(z.object({
      bankCode: z.string(),
      accountNumber: z.string(),
      accountName: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new Error('NOT_A_SELLER');
      
      return await revenueService.updatePayoutAccount(seller.id, input);
    }),

  approvePayout: adminProcedure
    .input(z.object({ payoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await revenueService.approvePayout(input.payoutId, ctx.session.user.id);
    }),

  listPendingPayouts: adminProcedure.query(async () => {
    return await payoutService.findMany({
      where: { status: 'PENDING' },
      include: { seller: true }
    });
  }),

  listAllPayouts: adminProcedure.query(async () => {
    return await payoutService.findMany({
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }),
});

export const revenueRouter = _revenueRouter;
export type RevenueRouter = typeof _revenueRouter;
