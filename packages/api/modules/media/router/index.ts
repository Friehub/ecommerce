import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import { mediaService } from '../services/media-service';

const _mediaRouter = createTRPCRouter({
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
