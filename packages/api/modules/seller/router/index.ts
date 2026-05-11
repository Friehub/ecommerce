import { createTRPCRouter, sellerProcedure, adminProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { adminService } from "../../admin/services/admin-service.js";
import { sellerDashboardService } from "../services/seller-dashboard-service.js";

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
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

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
        take: limit,
        skip: offset,
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

  bulkActivateProducts: sellerProcedure
    .input(z.object({
      productIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id }
      });
      if (!seller) throw new Error('NOT_A_SELLER');
      
      // Update status to ACTIVE
      const result = await prisma.product.updateMany({
        where: {
          id: { in: input.productIds },
          sellerId: seller.id
        },
        data: {
          status: 'ACTIVE'
        }
      });

      // Sync to search index for each product
      const products = await prisma.product.findMany({
        where: { id: { in: input.productIds } },
        include: { variants: true }
      });

      const { catalogService } = await import('../../../modules/catalog/services/catalog-service.js');
      for (const product of products) {
        for (const variant of product.variants) {
          await catalogService.syncToSearch(variant.id);
        }
      }

      return result;
    }),

  createCoupon: sellerProcedure
    .input(z.object({
      code: z.string().min(3).max(20),
      name: z.string(),
      description: z.string().optional(),
      type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
      value: z.number(),
      usageLimit: z.number().optional(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id }
      });
      if (!seller) throw new Error('NOT_A_SELLER');

      return await prisma.promotion.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type as any,
          value: input.value,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          sellerId: seller.id,
          coupons: {
            create: {
              code: input.code.toUpperCase(),
              usageLimit: input.usageLimit,
            }
          }
        },
        include: { coupons: true }
      });
    }),

  listMyCoupons: sellerProcedure
    .query(async ({ ctx }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id }
      });
      if (!seller) throw new Error('NOT_A_SELLER');

      return await prisma.promotion.findMany({
        where: { sellerId: seller.id },
        include: { coupons: true },
        orderBy: { startDate: 'desc' }
      });
    }),
});

export const sellerRouter = _sellerRouter as any;
export type SellerRouter = typeof _sellerRouter;
