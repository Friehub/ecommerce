import { z } from 'zod';

export const CreateCampaignSchema = z.object({
  name: z.string().min(3),
  budget: z.number().positive(),
  startDate: z.date(),
  endDate: z.date().optional()
});

export const AddAdGroupSchema = z.object({
  campaignId: z.string(),
  productId: z.string(),
  bid: z.number().positive(),
  keywords: z.array(z.string())
});

export const RecordActionSchema = z.object({
  adGroupId: z.string(),
});
