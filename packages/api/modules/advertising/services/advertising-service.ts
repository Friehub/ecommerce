import { prisma, Decimal } from '@ecom/db';
import { publishEvent } from '@ecom/shared';

export const advertisingService = {
  async createCampaign(sellerId: string, name: string, budget: number, startDate: Date, endDate?: Date) {
    return prisma.adCampaign.create({
      data: {
        sellerId,
        name,
        budget: new Decimal(budget),
        startDate,
        endDate,
        status: 'ACTIVE'
      }
    });
  },

  async addAdGroup(campaignId: string, productId: string, bid: number, keywords: string[]) {
    return prisma.adGroup.create({
      data: {
        campaignId,
        productId,
        bid: new Decimal(bid),
        keywords: {
          create: keywords.map(text => ({ text }))
        }
      }
    });
  },

  async recordImpression(adGroupId: string, userId?: string) {
    const impression = await prisma.adImpression.create({
      data: {
        adGroupId,
        userId
      }
    });

    await publishEvent('ad.impression', { adGroupId, userId });
    return impression;
  },

  async recordClick(adGroupId: string, userId?: string, ipAddress: string = 'unknown') {
    const { redis } = await import('@ecom/shared');
    const { lockManager } = await import('../../shared/services/managers/lock-manager');

    // 1. Bot/Fraud Protection: Limit 1 charge per 10 minutes per User/IP
    const fraudKey = `ad_click_lock:${adGroupId}:${userId || ipAddress}`;
    const isRateLimited = await redis.get(fraudKey);
    if (isRateLimited) {
      console.log(`[AdvertisingService] Potential click fraud or duplicate click detected for ad ${adGroupId}. Ignoring charge.`);
      return null;
    }

    const adGroup = await prisma.adGroup.findUnique({
      where: { id: adGroupId },
      include: {
        campaign: { include: { seller: true } }
      }
    });

    if (!adGroup || adGroup.campaign.status !== 'ACTIVE') return null;

    // Prevent self-clicks
    if (userId && adGroup.campaign.seller.userId === userId) return null;

    const bidCost = adGroup.bid;

    return await lockManager.withLock(`ad_spend:${adGroup.campaignId}`, async () => {
      // 2. Set rate limit flag in Redis (10 min expiry)
      await redis.set(fraudKey, '1', 'EX', 600);

      return prisma.$transaction(async (tx) => {
        const click = await tx.adClick.create({
          data: { adGroupId, userId, cost: bidCost }
        });

        await tx.sellerLedgerEntry.create({
          data: {
            sellerId: adGroup.campaign.sellerId,
            type: 'AD_SPEND',
            amount: bidCost.negated(),
            status: 'AVAILABLE'
          }
        });

        // 3. Budget exhaustion check (TODO: Denormalize 'spent' for better performance)
        const totalSpend = await tx.adClick.aggregate({
          where: { adGroup: { campaignId: adGroup.campaignId } },
          _sum: { cost: true }
        });

        const currentSpend = totalSpend._sum.cost || new Decimal(0);

        if (currentSpend.greaterThanOrEqualTo(adGroup.campaign.budget)) {
          await tx.adCampaign.update({
            where: { id: adGroup.campaignId },
            data: { status: 'OUT_OF_BUDGET' }
          });
        }

        await publishEvent('ad.click', { adGroupId, userId, cost: bidCost.toNumber() });
        return click;
      });
    });
  },

  async getSellerCampaigns(sellerId: string) {
    return prisma.adCampaign.findMany({
      where: { sellerId },
      include: {
        adGroups: {
          include: {
            product: { select: { id: true, title: true } },
            _count: { select: { clicks: true, impressions: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateCampaignStatus(sellerId: string, campaignId: string, status: 'ACTIVE' | 'PAUSED' | 'ENDED') {
    return prisma.adCampaign.update({
      where: { id: campaignId, sellerId },
      data: { status }
    });
  },

  async selectSponsoredResult(query: string) {
    if (!query) return null;
    
    // Find highest bidder for matching keywords
    const matchingGroups = await prisma.adGroup.findMany({
      where: {
        campaign: { status: 'ACTIVE' },
        keywords: {
          some: {
            text: { contains: query.trim().toLowerCase(), mode: 'insensitive' }
          }
        }
      },
      include: {
        product: {
          include: { 
            media: { orderBy: { position: 'asc' }, take: 1 }, 
            brand: true, 
            category: true,
            variants: { take: 1 } 
          }
        },
        campaign: { select: { sellerId: true } }
      },
      orderBy: { bid: 'desc' },
      take: 1
    });

    const group = matchingGroups[0];
    if (!group) return null;

    // Record an implicit impression when selected for search
    await this.recordImpression(group.id);

    return {
      ...group.product,
      adGroupId: group.id,
      isSponsored: true,
      bid: group.bid
    };
  }
};
