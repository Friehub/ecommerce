import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import { mediaService } from '../services/media-service';

export const mediaRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string()
    }))
    .mutation(async ({ input }) => {
      return mediaService.getUploadUrl(input.filename, input.contentType);
    }),
});
