import { createTRPCRouter, sellerProcedure, adminProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { sellerDashboardService } from "../services/seller-dashboard-service";

export const sellerRouter = createTRPCRouter({
  getDashboardMetrics: sellerProcedure.query(async ({ ctx }) => {
    // We need to get the seller ID for the user
    const seller = await prisma.seller.findUnique({
      where: { userId: ctx.session.user.id }
    });
    
    if (!seller) throw new Error('NOT_A_SELLER');
    
    return await sellerDashboardService.getMetrics(seller.id);
  }),

  approveSeller: adminProcedure
    .input(z.object({ sellerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await sellerDashboardService.approveKYC(input.sellerId, ctx.session.user.id);
    }),

  listPendingSellers: adminProcedure.query(async () => {
    return await prisma.seller.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: { user: true, documents: true }
    });
  }),
});
