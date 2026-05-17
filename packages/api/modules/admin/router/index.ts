import { prisma, SellerStatus, OrderStatus } from '@ecom/db';
import { createTRPCRouter, adminProcedure } from '../../../trpc.js';
import { ApproveSellerSchema, ResolveDisputeSchema, ManualRefundSchema } from '../schemas/index.js';
import { adminService } from '../services/admin-service.js';
import { orderService } from '../../order/services/order-service.js';
import { z } from 'zod';

const sellerService = prisma.seller;
const userService = prisma.user;
const eventLogService = prisma.eventLog;
const productVariantService = prisma.productVariant;
const flashSaleService = prisma.flashSale;
const productService = prisma.product;
const bannerService = prisma.banner;

const _adminRouter = createTRPCRouter({
  approveSeller: adminProcedure
    .input(ApproveSellerSchema)
    .mutation(async ({ ctx, input }) => {
      return adminService.approveSellerKYC(ctx.session.user.id, input.sellerId);
    }),

  reviewDocument: adminProcedure
    .input(z.object({
      documentId: z.string(),
      decision: z.enum(['APPROVED', 'REJECTED']),
      rejectionReason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return adminService.reviewDocument(
        ctx.session.user.id,
        input.documentId,
        input.decision,
        input.rejectionReason
      );
    }),

  listAllSellers: adminProcedure
    .query(async () => {
      return sellerService.findMany({
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }),

  listAllUsers: adminProcedure
    .query(async () => {
      return userService.findMany({
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    }),

  updateSellerStatus: adminProcedure
    .input(z.object({
      sellerId: z.string(),
      status: z.nativeEnum(SellerStatus)
    }))
    .mutation(async ({ ctx, input }) => {
      const { publishEvent } = await import('@ecom/shared');
      
      const seller = await sellerService.update({
        where: { id: input.sellerId },
        data: { status: input.status }
      });

      // Publish specific or generic event
      const eventType = input.status === 'SUSPENDED' ? 'seller.suspended' : 'seller.status_updated';
      await publishEvent(eventType as any, { sellerId: input.sellerId, status: input.status });

      // Audit Log
      await eventLogService.create({
        data: {
          topic: 'ADMIN_ACTION',
          payload: { 
            adminId: ctx.session.user.id, 
            action: 'UPDATE_SELLER_STATUS', 
            targetId: input.sellerId, 
            newStatus: input.status 
          }
        }
      });

      return seller;
    }),

  updateUserStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      status: z.enum(['ACTIVE', 'SUSPENDED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const { publishEvent } = await import('@ecom/shared');
      const user = await userService.update({
        where: { id: input.userId },
        data: { isActive: input.status === 'ACTIVE' }
      });

      if (input.status === 'SUSPENDED') {
        await publishEvent('seller.suspended', { userId: input.userId }); // Generic user suspension event
      }

      await eventLogService.create({
        data: {
          topic: 'ADMIN_ACTION',
          payload: { adminId: ctx.session.user.id, action: 'UPDATE_USER_STATUS', targetId: input.userId, status: input.status }
        }
      });

      return user;
    }),

  getFraudQueue: adminProcedure
    .query(async () => {
      return orderService.findMany({
        where: { status: 'FRAUD_REVIEW' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }),

  resolveFraudReview: adminProcedure
    .input(z.object({
      orderId: z.string(),
      action: z.enum(['ALLOW', 'BLOCK'])
    }))
    .mutation(async ({ input }) => {
      const targetStatus: OrderStatus = input.action === 'ALLOW' ? 'PROCESSING' : 'CANCELLED';
      return await orderService.updateStatus(input.orderId, targetStatus);
    }),

  getDisputeQueue: adminProcedure
    .query(async () => {
      return adminService.getDisputeQueue();
    }),

  getPendingSellers: adminProcedure
    .query(async () => {
      return sellerService.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        include: { 
          user: { select: { email: true, firstName: true, lastName: true } },
          documents: true
        },
        orderBy: { createdAt: 'asc' }
      });
    }),

  getPendingKYCQueue: adminProcedure
    .query(async () => {
      return adminService.getPendingKYCQueue();
    }),

  resolveDispute: adminProcedure
    .input(ResolveDisputeSchema)
    .mutation(async ({ ctx, input }) => {
      return adminService.resolveDispute(
        ctx.session.user.id,
        input.disputeId,
        input.resolution,
        input.refundAmount
      );
    }),

  manualRefund: adminProcedure
    .input(ManualRefundSchema)
    .mutation(async ({ ctx, input }) => {
      return adminService.manualRefund(
        ctx.session.user.id,
        input.orderId,
        input.amount,
        input.reason
      );
    }),

  listAllVariants: adminProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const search = input?.search;
      return productVariantService.findMany({
        where: search ? {
          OR: [
            { sku: { contains: search, mode: 'insensitive' } },
            { product: { title: { contains: search, mode: 'insensitive' } } }
          ]
        } : undefined,
        take: search ? 25 : 50, // Limits results for optimal load
        include: {
          product: {
            select: {
              title: true,
              seller: { select: { id: true, businessName: true } }
            }
          }
        }
      });
    }),

  listFlashSales: adminProcedure
    .query(async () => {
      return flashSaleService.findMany({
        include: {
          variant: {
            include: {
              product: {
                select: {
                  title: true,
                  seller: { select: { businessName: true } }
                }
              }
            }
          }
        },
        orderBy: { startTime: 'desc' }
      });
    }),

  createFlashSale: adminProcedure
    .input(z.object({
      variantId: z.string(),
      sellerId: z.string(),
      salePrice: z.number(),
      qtyLimit: z.number(),
      startTime: z.string(),
      endTime: z.string()
    }))
    .mutation(async ({ input }) => {
      return flashSaleService.create({
        data: {
          variantId: input.variantId,
          sellerId: input.sellerId,
          salePrice: input.salePrice,
          qtyLimit: input.qtyLimit,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime)
        }
      });
    }),

  deleteFlashSale: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return flashSaleService.delete({
        where: { id: input.id }
      });
    }),

  releaseMatureEscrow: adminProcedure
    .mutation(async () => {
      const { ledgerService } = await import('../../revenue/services/ledger-service.js');
      return await ledgerService.releaseMatureEscrow();
    }),

  getPendingProducts: adminProcedure
    .query(async () => {
      return productService.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: { 
          seller: { select: { businessName: true } },
          category: { select: { name: true } },
          brand: { select: { name: true } },
          media: { take: 1 }
        },
        orderBy: { createdAt: 'asc' }
      });
    }),

  moderateProduct: adminProcedure
    .input(z.object({
      productId: z.string(),
      decision: z.enum(['APPROVED', 'REJECTED']),
      rejectionReason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { publishEvent } = await import('@ecom/shared');
      const { catalogService } = await import('../../catalog/services/catalog-service.js');

      const status = input.decision === 'APPROVED' ? 'ACTIVE' : 'REJECTED';
      
      const product = await productService.update({
        where: { id: input.productId },
        data: { status },
        include: { variants: true }
      }) as any;

      await publishEvent('product.moderated', { 
        productId: input.productId, 
        sellerId: product.sellerId,
        decision: input.decision,
        reason: input.rejectionReason 
      });

      // If approved, sync all variants to search
      if (input.decision === 'APPROVED') {
        for (const variant of product.variants) {
          await catalogService.syncToSearch(variant.id);
        }
      }

      return product;
    }),

  listBanners: adminProcedure
    .query(async () => {
      return bannerService.findMany({
        orderBy: { position: 'asc' }
      });
    }),

  createBanner: adminProcedure
    .input(z.object({
      title: z.string(),
      imageUrl: z.string(),
      link: z.string().optional(),
      position: z.number().default(0)
    }))
    .mutation(async ({ input }) => {
      const { cacheService } = await import('@ecom/shared');
      const banner = await bannerService.create({ data: input });
      await cacheService.delete('content:banners');
      return banner;
    }),

  updateBanner: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      imageUrl: z.string().optional(),
      link: z.string().optional(),
      position: z.number().optional(),
      isActive: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const { cacheService } = await import('@ecom/shared');
      const { id, ...data } = input;
      const banner = await bannerService.update({
        where: { id },
        data
      });
      await cacheService.delete('content:banners');
      return banner;
    }),

  deleteBanner: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { cacheService } = await import('@ecom/shared');
      await bannerService.delete({ where: { id: input.id } });
      await cacheService.delete('content:banners');
      return { success: true };
    }),

  listPendingPayouts: adminProcedure
    .query(async () => {
      const { ledgerService } = await import('../../revenue/services/ledger-service.js');
      return await ledgerService.listPendingPayouts();
    }),

  reviewPayout: adminProcedure
    .input(z.object({
      payoutId: z.string(),
      decision: z.enum(['APPROVED', 'REJECTED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const { ledgerService } = await import('../../revenue/services/ledger-service.js');
      if (input.decision === 'APPROVED') {
        return await ledgerService.approvePayout(input.payoutId, ctx.session.user.id);
      } else {
        return await ledgerService.rejectPayout(input.payoutId, ctx.session.user.id);
      }
    }),
});

export const adminRouter = _adminRouter;
export type AdminRouter = typeof _adminRouter;

