import { createTRPCRouter, sellerProcedure, publicProcedure } from '../../../trpc';
import { z } from 'zod';
import { CreateCampaignSchema, AddAdGroupSchema, RecordActionSchema } from '../schemas';
import { advertisingService } from '../services/advertising-service';

export const advertisingRouter = createTRPCRouter({
  createCampaign: sellerProcedure
    .input(CreateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      return advertisingService.createCampaign(
        ctx.session.user.sellerProfile!.id,
        input.name,
        input.budget,
        input.startDate,
        input.endDate
      );
    }),

  addAdGroup: sellerProcedure
    .input(AddAdGroupSchema)
    .mutation(async ({ input }) => {
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
      return advertisingService.recordImpression(input.adGroupId, userId);
    }),

  recordClick: publicProcedure
    .input(RecordActionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      return advertisingService.recordClick(input.adGroupId, userId);
    }),

  getCampaigns: sellerProcedure
    .query(async ({ ctx }) => {
      return advertisingService.getSellerCampaigns(ctx.session.user.sellerProfile!.id);
    }),

  updateStatus: sellerProcedure
    .input(z.object({
      campaignId: z.string(),
      status: z.enum(['ACTIVE', 'PAUSED', 'ENDED'])
    }))
    .mutation(async ({ ctx, input }) => {
      return advertisingService.updateCampaignStatus(
        ctx.session.user.sellerProfile!.id,
        input.campaignId,
        input.status
      );
    }),
});
