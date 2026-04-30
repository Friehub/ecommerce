import { createTRPCRouter, adminProcedure } from '../../../trpc';
import { ApproveSellerSchema, ResolveDisputeSchema, ManualRefundSchema } from '../schemas';
import { adminService } from '../services/admin-service';

export const adminRouter = createTRPCRouter({
  approveSeller: adminProcedure
    .input(ApproveSellerSchema)
    .mutation(async ({ ctx, input }) => {
      return adminService.approveSellerKYC(ctx.session.user.id, input.sellerId);
    }),

  getDisputeQueue: adminProcedure
    .query(async () => {
      return adminService.getDisputeQueue();
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
