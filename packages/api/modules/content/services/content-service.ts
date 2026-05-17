import { prisma } from '@ecom/db'
import { cacheService } from '@ecom/shared'

const bannerService = prisma.banner;
const productService = prisma.product;

export const contentService = {
  async getBanners() {
    return cacheService.wrap('content:banners', async () => {
      const banners = await bannerService.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' }
      });

      if (banners.length === 0) {
        return [
          { id: '1', title: 'Tech Week', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', link: '/category/electronics' },
          { id: '2', title: 'Fashion Sale', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', link: '/category/fashion' },
          { id: '3', title: 'Flash Sales', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e', link: '/flash-sales' },
        ];
      }
      return banners;
    }, 3600);
  },

  async getRecommendations(userId?: string) {
    const cacheKey = userId ? `content:recommendations:${userId}` : 'content:recommendations:guest';
    
    return cacheService.wrap(cacheKey, async () => {
      // 1. Try Rust recommendations service (Fix 3.2)
      if (userId) {
        try {
          const { RustClient } = await import('../../../rust-client.js');
          const recs = await RustClient.recommendations.forUser(userId);
          if (recs && recs.length > 0) {
            return productService.findMany({
              where: { id: { in: recs.map((r: any) => r.id || r) }, status: 'ACTIVE' },
              include: { variants: true, brand: true, category: true, media: true },
            });
          }
        } catch (e) {
          console.warn('[Recommendations] Rust service failed, falling back to recent products:', e);
        }
      }

      // 2. Fallback to recent active products
      return productService.findMany({
        where: { status: 'ACTIVE' },
        include: { variants: true, brand: true, category: true, media: true },
        take: 12,
        orderBy: { createdAt: 'desc' }
      });
    }, 600); // Cache for 10 minutes
  }
};
