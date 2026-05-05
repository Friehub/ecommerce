import { createTRPCRouter, sellerProcedure, publicProcedure } from '../../../trpc';
import { z } from 'zod';
import { CreateCampaignSchema, AddAdGroupSchema, RecordActionSchema } from '../schemas';
import { advertisingService } from '../services/advertising-service';
import { prisma } from '@ecom/db';
import { redis } from '@ecom/shared';
import { TRPCError } from '@trpc/server';

const _advertisingRouter = createTRPCRouter({
  createCampaign: sellerProcedure
    .input(CreateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      // F03: Look up seller from DB since sellerProfile is not in session type
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found' });

      return advertisingService.createCampaign(
        seller.id,
        input.name,
        input.budget,
        input.startDate,
        input.endDate
      );
    }),

  addAdGroup: sellerProcedure
    .input(AddAdGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'FORBIDDEN' });

      // F07: Add campaign ownership check
      const campaign = await prisma.adCampaign.findUnique({
        where: { id: input.campaignId }
      });
      if (!campaign || campaign.sellerId !== seller.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Campaign does not belong to this seller' });
      }

      return advertisingService.addAdGroup(
        input.campaignId,
        input.productId,
        input.bid,
        input.keywords
      );
    }),

  recordImpression: publicProcedure
    .input(RecordActionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const ip = (ctx.req as any)?.ip || 'unknown';

      // F08: Deduplication and rate limiting
      const dedupeKey = `ad:imp:${input.adGroupId}:${userId ?? ip}`;
      const isNew = await redis.set(dedupeKey, '1', 'EX', 3600, 'NX');
      if (!isNew) return null;

      return advertisingService.recordImpression(input.adGroupId, userId);
    }),

  recordClick: publicProcedure
    .input(RecordActionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const ip = (ctx.req as any)?.ip || 'unknown';

      // F08: Deduplication and rate limiting to prevent click fraud
      const dedupeKey = `ad:clk:${input.adGroupId}:${userId ?? ip}`;
      const isNew = await redis.set(dedupeKey, '1', 'EX', 3600, 'NX');
      if (!isNew) return null;

      return advertisingService.recordClick(input.adGroupId, userId);
    }),

  getCampaigns: sellerProcedure
    .query(async ({ ctx }) => {
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });
      return advertisingService.getSellerCampaigns(seller.id);
    }),

  updateStatus: sellerProcedure
    .input(z.object({
      campaignId: z.string(),
      status: z.enum(['ACTIVE', 'PAUSED', 'ENDED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });

      return advertisingService.updateCampaignStatus(
        seller.id,
        input.campaignId,
        input.status
      );
    }),
});

export const advertisingRouter = _advertisingRouter as any;
export type AdvertisingRouter = typeof _advertisingRouter;
