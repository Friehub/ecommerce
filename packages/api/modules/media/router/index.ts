import { createTRPCRouter, protectedProcedure } from '../../../trpc.js';
import { z } from 'zod';
import { mediaService } from '../services/media-service.js';

const _mediaRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(z.object({
      path: z.string().optional(),
      filename: z.string().optional(),
      contentType: z.string()
    }))
    .mutation(async ({ input }) => {
      return mediaService.getUploadUrl(input.path || input.filename || 'file', input.contentType);
    }),
  getPresignedUrl: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string()
    }))
    .mutation(async ({ input }) => {
      return mediaService.getUploadUrl(input.filename, input.contentType);
    }),
});

export const mediaRouter = _mediaRouter as any;
export type MediaRouter = typeof _mediaRouter;
