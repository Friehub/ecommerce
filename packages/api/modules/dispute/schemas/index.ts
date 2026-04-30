import { z } from 'zod';

export const OpenDisputeSchema = z.object({
  orderId: z.string(),
  orderLineId: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters long"),
});

export const RespondDisputeSchema = z.object({
  disputeId: z.string(),
  content: z.string().min(2, "Content is required"),
});

export const UploadEvidenceSchema = z.object({
  disputeId: z.string(),
  url: z.string().url(),
  type: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER']),
});

export const GetDisputeSchema = z.object({
  disputeId: z.string(),
});
