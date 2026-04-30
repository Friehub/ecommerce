import { z } from 'zod';

export const GenerateLinkSchema = z.object({
  targetType: z.enum(['PRODUCT', 'CATEGORY', 'HOME']),
  targetId: z.string().optional()
});

export const RecordClickSchema = z.object({
  slug: z.string(),
  sessionId: z.string()
});
