import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { OpenDisputeSchema, RespondDisputeSchema, UploadEvidenceSchema, GetDisputeSchema } from '../schemas';
import { disputeService } from '../services/dispute-service';
import { prisma } from '@ecom/db';
import { z } from 'zod';

const _disputeRouter = createTRPCRouter({
  open: protectedProcedure
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

  getById: protectedProcedure
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

  listAllDisputes: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true }
      });
      if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') throw new Error('UNAUTHORIZED');
      return prisma.dispute.findMany({
        include: {
          order: { select: { id: true, total: true } },
          buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
          seller: { select: { id: true, businessName: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }),

  resolveDispute: protectedProcedure
    .input(z.object({
      disputeId: z.string(),
      resolution: z.string(),
      status: z.enum(['RESOLVED', 'REJECTED']),
      refundAmount: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true }
      });
      if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') throw new Error('UNAUTHORIZED');

      const dispute = await prisma.dispute.findUnique({
        where: { id: input.disputeId },
        select: { id: true, status: true }
      });
      if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

      await prisma.dispute.update({
        where: { id: input.disputeId },
        data: { status: input.status }
      });

      return prisma.disputeResolution.create({
        data: {
          disputeId: input.disputeId,
          resolvedById: ctx.session.user.id,
          resolution: input.resolution,
          refundAmount: input.refundAmount || 0
        }
      });
    }),
});

export const disputeRouter = _disputeRouter as any;
export type DisputeRouter = typeof _disputeRouter;
