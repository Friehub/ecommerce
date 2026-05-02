import { prisma, SellerStatus, OrderStatus } from '@ecom/db';
import { createTRPCRouter, adminProcedure } from '../../../trpc';
import { ApproveSellerSchema, ResolveDisputeSchema, ManualRefundSchema } from '../schemas';
import { adminService } from '../services/admin-service';
import { z } from 'zod';

export const adminRouter = createTRPCRouter({
  approveSeller: adminProcedure
    .input(ApproveSellerSchema)
    .mutation(async ({ ctx, input }) => {
      return adminService.approveSellerKYC(ctx.session.user.id, input.sellerId);
    }),

  listAllSellers: adminProcedure
    .query(async () => {
      return prisma.seller.findMany({
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }),

  updateSellerStatus: adminProcedure
    .input(z.object({
      sellerId: z.string(),
      status: z.nativeEnum(SellerStatus)
    }))
    .mutation(async ({ input }) => {
      return prisma.seller.update({
        where: { id: input.sellerId },
        data: { status: input.status }
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
      const status = input.action === 'ALLOW' ? 'PAID' : 'CANCELLED';
      return prisma.order.update({
        where: { id: input.orderId },
        data: { status }
      });
    }),

  getDisputeQueue: adminProcedure
    .query(async () => {
      return adminService.getDisputeQueue();
    }),

  getPendingSellers: adminProcedure
    .query(async () => {
      return prisma.seller.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
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
});
