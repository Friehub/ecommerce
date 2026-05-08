import { prisma } from '@ecom/db'
import { cacheService } from '@ecom/shared'
import type { Service } from '../../../types.js'

export const contentService: Service = {
  async getBanners() {
    return cacheService.wrap('content:banners', async () => {
      return [
        { id: '1', title: 'Tech Week', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', link: '/category/electronics' },
        { id: '2', title: 'Fashion Sale', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', link: '/category/fashion' },
        { id: '3', title: 'Flash Sales', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e', link: '/flash-sales' },
      ];
    }, 3600);
  },

  async getRecommendations(userId?: string) {
    const cacheKey = userId ? `content:recommendations:${userId}` : 'content:recommendations:guest';
    
    return cacheService.wrap(cacheKey, async () => {
      return prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: { variants: true, brand: true, category: true, media: true },
        take: 12,
        orderBy: { createdAt: 'desc' }
      });
    }, 600); // Cache for 10 minutes
  }
};
