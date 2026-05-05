import { createTRPCRouter, sellerProcedure, adminProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { adminService } from "../../admin/services/admin-service";
import { sellerDashboardService } from "../services/seller-dashboard-service";

const _sellerRouter = createTRPCRouter({
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
      return await adminService.approveSellerKYC(ctx.session.user.id, input.sellerId);
    }),

  listPendingSellers: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      return await prisma.seller.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        include: { user: true, documents: true },
        take: input.limit,
        skip: input.offset,
      });
    }),

  listMyProducts: sellerProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id }
      });
      
      if (!seller) throw new Error('NOT_A_SELLER');
      
      return await prisma.product.findMany({
        where: { sellerId: seller.id },
        include: {
          variants: {
            include: {
              stockLevels: true
            }
          },
          category: true,
          brand: true,
          media: true,
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });
    }),

  bulkDeactivateProducts: sellerProcedure
    .input(z.object({
      productIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id }
      });
      
      if (!seller) throw new Error('NOT_A_SELLER');
      
      return await prisma.product.updateMany({
        where: {
          id: { in: input.productIds },
          sellerId: seller.id
        },
        data: {
          status: 'DRAFT' // Or DEACTIVATED if we have that status
        }
      });
    }),
});

export const sellerRouter = _sellerRouter as any;
export type SellerRouter = typeof _sellerRouter;
