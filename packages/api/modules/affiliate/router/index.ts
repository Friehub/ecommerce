import { createTRPCRouter, protectedProcedure, publicProcedure } from '../../../trpc';
import { GenerateLinkSchema, RecordClickSchema } from '../schemas';
import { affiliateService } from '../services/affiliate-service';

export const affiliateRouter = createTRPCRouter({
  register: protectedProcedure
    .mutation(async ({ ctx }) => {
      return affiliateService.registerAgent(ctx.session.user.id);
    }),

  generateLink: protectedProcedure
    .input(GenerateLinkSchema)
    .mutation(async ({ ctx, input }) => {
      const agent = await affiliateService.registerAgent(ctx.session.user.id);
      return affiliateService.generateLink(agent.id, input.targetType, input.targetId);
    }),

  recordClick: publicProcedure
    .input(RecordClickSchema)
    .mutation(async ({ input, ctx }) => {
      // Pass remote IP if available from ctx.req, otherwise undefined
      const ip = ctx.req?.headers?.get('x-forwarded-for') || undefined;
      return affiliateService.recordClick(input.slug, input.sessionId, ip);
    }),
});
