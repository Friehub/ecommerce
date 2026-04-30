import { z } from 'zod';

export const UpdatePreferenceSchema = z.object({
  type: z.string(),
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean()
});

export const MarkAsReadSchema = z.object({
  notificationId: z.string()
});
