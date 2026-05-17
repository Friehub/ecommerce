import { createTRPCRouter, sellerProcedure, publicProcedure } from '../../../trpc.js';
import { z } from 'zod';
import { CreateCampaignSchema, AddAdGroupSchema, RecordActionSchema } from '../schemas/index.js';
import { advertisingService } from '../services/advertising-service.js';
import { prisma } from '@ecom/db';
import { redis } from '@ecom/shared';
import { TRPCError } from '@trpc/server';

const sellerService = prisma.seller;
const adCampaignService = prisma.adCampaign;

const _advertisingRouter = createTRPCRouter({
  createCampaign: sellerProcedure
    .input(CreateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      // F03: Look up seller from DB since sellerProfile is not in session type
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
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
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'FORBIDDEN' });

      // F07: Add campaign ownership check
      const campaign = await adCampaignService.findUnique({
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
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });
      return advertisingService.getSellerCampaigns(seller.id);
    }),

  updateStatus: sellerProcedure
    .input(z.object({
      campaignId: z.string(),
      status: z.enum(['ACTIVE', 'PAUSED', 'ENDED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });

      return advertisingService.updateCampaignStatus(
        seller.id,
        input.campaignId,
        input.status
      );
    }),

  pauseCampaign: sellerProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });
      return advertisingService.updateCampaignStatus(seller.id, input.campaignId, 'PAUSED');
    }),

  resumeCampaign: sellerProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });
      return advertisingService.updateCampaignStatus(seller.id, input.campaignId, 'ACTIVE');
    }),

  stopCampaign: sellerProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({ where: { userId: ctx.session.user.id } });
      if (!seller) throw new TRPCError({ code: 'NOT_FOUND' });
      return advertisingService.updateCampaignStatus(seller.id, input.campaignId, 'ENDED');
    }),
});

export const advertisingRouter = _advertisingRouter;
export type AdvertisingRouter = typeof _advertisingRouter;
