import { createTRPCRouter, protectedProcedure, adminProcedure } from '../../../trpc.js';
import { OpenDisputeSchema, RespondDisputeSchema, UploadEvidenceSchema, GetDisputeSchema } from '../schemas/index.js';
import { disputeService } from '../services/dispute-service.js';
import { paymentService } from '../../payment/services/payment-service.js';
import { prisma } from '@ecom/db';
import { publishEvent } from '@ecom/shared';
import { z } from 'zod';

const _disputeRouter = createTRPCRouter({
  openDispute: protectedProcedure
    .input(OpenDisputeSchema)
    .mutation(async ({ ctx, input }) => {
      return disputeService.openDispute(
        ctx.session.user.id,
        input.orderId,
        input.reason,
        input.orderLineId
      );
    }),

  respond: protectedProcedure
    .input(RespondDisputeSchema)
    .mutation(async ({ ctx, input }) => {
      return disputeService.respondToDispute(
        input.disputeId,
        ctx.session.user.id,
        input.content
      );
    }),

  uploadEvidence: protectedProcedure
    .input(UploadEvidenceSchema)
    .mutation(async ({ ctx, input }) => {
      return disputeService.uploadEvidence(
        input.disputeId,
        ctx.session.user.id,
        input.url,
        input.type
      );
    }),

  getThread: protectedProcedure
    .input(GetDisputeSchema)
    .query(async ({ ctx, input }) => {
      return disputeService.getDisputeThread(
        input.disputeId,
        ctx.session.user.id
      );
    }),

  listMyDisputes: protectedProcedure
    .query(async ({ ctx }) => {
      return disputeService.getMyDisputes(ctx.session.user.id);
    }),

  escalate: protectedProcedure
    .input(GetDisputeSchema)
    .mutation(async ({ ctx, input }) => {
      return disputeService.escalateDispute(input.disputeId, ctx.session.user.id);
    }),

  listAllDisputes: adminProcedure
    .query(async () => {
      return prisma.dispute.findMany({
        include: {
          order: { select: { id: true, total: true } },
          buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
          seller: { select: { id: true, businessName: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }),

  resolveDispute: adminProcedure
    .input(z.object({
      disputeId: z.string(),
      resolution: z.string(),
      status: z.enum(['RESOLVED', 'REJECTED']),
      refundAmount: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {

      const dispute = await prisma.dispute.findUnique({
        where: { id: input.disputeId },
        select: { id: true, status: true, buyerId: true }
      });
      if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

      const resolution = await prisma.$transaction(async (tx) => {
        // 1. Update status
        await tx.dispute.update({
          where: { id: input.disputeId },
          data: { status: input.status }
        });

        // 2. Create resolution record
        const res = await tx.disputeResolution.create({
          data: {
            disputeId: input.disputeId,
            resolvedById: ctx.session.user.id,
            resolution: input.resolution,
            refundAmount: input.refundAmount || 0
          }
        });

        // 3. Process actual refund if amount > 0
        if (input.status === 'RESOLVED' && input.refundAmount && input.refundAmount > 0) {
          console.log(`[Dispute] Processing refund of ₦${input.refundAmount} for dispute ${input.disputeId}`);
          await paymentService.fundWallet(dispute.buyerId, input.refundAmount, tx);
        }

        return res;
      });

      await publishEvent('dispute.resolved', {
        disputeId: input.disputeId,
        status: input.status,
        resolution: input.resolution
      });

      return resolution;
    }),
});

export const disputeRouter = _disputeRouter;
export type DisputeRouter = typeof _disputeRouter;
