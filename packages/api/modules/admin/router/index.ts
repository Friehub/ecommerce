import { prisma, SellerStatus, OrderStatus } from '@ecom/db';
import { createTRPCRouter, adminProcedure } from '../../../trpc.js';
import { ApproveSellerSchema, ResolveDisputeSchema, ManualRefundSchema } from '../schemas/index.js';
import { adminService } from '../services/admin-service.js';
import { orderService } from '../../order/services/order-service.js';
import { z } from 'zod';

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
      return prisma.seller.findMany({
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }),

  listAllUsers: adminProcedure
    .query(async () => {
      return prisma.user.findMany({
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
      
      const seller = await prisma.seller.update({
        where: { id: input.sellerId },
        data: { status: input.status }
      });

      // Publish specific or generic event
      const eventType = input.status === 'SUSPENDED' ? 'seller.suspended' : 'seller.status_updated';
      await publishEvent(eventType as any, { sellerId: input.sellerId, status: input.status });

      // Audit Log
      await prisma.eventLog.create({
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
    .mutation(async ({ input }) => {
      return prisma.user.update({
        where: { id: input.userId },
        data: { isActive: input.status === 'ACTIVE' }
      });
    }),

  getFraudQueue: adminProcedure
    .query(async () => {
      return prisma.order.findMany({
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
      const targetStatus: OrderStatus = input.action === 'ALLOW' ? 'PAID' : 'CANCELLED';
      return await orderService.updateStatus(input.orderId, targetStatus);
    }),

  getDisputeQueue: adminProcedure
    .query(async () => {
      return adminService.getDisputeQueue();
    }),

  getPendingSellers: adminProcedure
    .query(async () => {
      return prisma.seller.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        include: { 
          user: { select: { email: true, firstName: true, lastName: true } },
          documents: true
        },
        orderBy: { createdAt: 'asc' }
      });
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
      return prisma.productVariant.findMany({
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
      return prisma.flashSale.findMany({
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
      return prisma.flashSale.create({
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
      return prisma.flashSale.delete({
        where: { id: input.id }
      });
    }),
});

export const adminRouter = _adminRouter as any;
export type AdminRouter = typeof _adminRouter;

