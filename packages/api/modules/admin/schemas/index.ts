import { z } from 'zod';

export const ApproveSellerSchema = z.object({
  sellerId: z.string()
});

export const ResolveDisputeSchema = z.object({
  disputeId: z.string(),
  resolution: z.enum(['RESOLVED', 'REJECTED']),
  refundAmount: z.number().min(0).optional()
});

export const ManualRefundSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  reason: z.string().min(5)
});
