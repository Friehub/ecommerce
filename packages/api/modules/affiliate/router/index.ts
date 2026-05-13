import { createTRPCRouter, protectedProcedure, publicProcedure } from '../../../trpc.js';
import { z } from 'zod';
import { GenerateLinkSchema, RecordClickSchema } from '../schemas/index.js';
import { affiliateService } from '../services/affiliate-service.js';

const _affiliateRouter = createTRPCRouter({
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

  getMyProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return affiliateService.getMyProfile(ctx.session.user.id);
    }),

  getMyCommissions: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().default(0)
    }))
    .query(async ({ ctx, input }) => {
      const agent = await affiliateService.registerAgent(ctx.session.user.id);
      return affiliateService.getCommissions(agent.id, input.limit, input.offset);
    }),

  getMyStats: protectedProcedure
    .query(async ({ ctx }) => {
      const agent = await affiliateService.registerAgent(ctx.session.user.id);
      return affiliateService.getAgentStats(agent.id);
    }),
});

export const affiliateRouter = _affiliateRouter as any;
export type AffiliateRouter = typeof _affiliateRouter;
