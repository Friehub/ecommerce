import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { OpenDisputeSchema, RespondDisputeSchema, UploadEvidenceSchema, GetDisputeSchema } from '../schemas';
import { disputeService } from '../services/dispute-service';

export const disputeRouter = createTRPCRouter({
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
});
