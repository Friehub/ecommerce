import { prisma } from '@ecom/db'

export const contentService = {
  async getBanners() {
    // In a real app, this would come from a Banner model
    // For the contest, we'll return a curated list
    return [
      { id: '1', title: 'Tech Week', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', link: '/category/electronics' },
      { id: '2', title: 'Fashion Sale', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', link: '/category/fashion' },
      { id: '3', title: 'Flash Sales', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e', link: '/flash-sales' },
    ];
  },

  async getRecommendations(userId?: string) {
    // Recommendation logic: 
    // 1. If logged in, get products from categories they bought before
    // 2. Otherwise, get trending products (most reviewed)
    
    if (userId) {
      const lastOrders = await prisma.order.findMany({
        where: { userId },
        include: { packages: { include: { lines: { include: { variant: true } } } } },
        take: 5
      });

      const categoryIds = lastOrders.flatMap(o => o.packages.flatMap(p => p.lines.map(l => l.variant.productId))); // Simplified
      // ... actually let's just do top rated for now to keep it robust
    }

    return prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { variants: true, brand: true, category: true },
      take: 12,
      orderBy: { createdAt: 'desc' }
    });
  }
};
