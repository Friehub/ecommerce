import { prisma } from '@ecom/db';
import { RustClient } from '../../../../rust-client';

export class SearchManager {
  async syncToSearch(variantId: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            seller: true,
            media: true,
          }
        }
      }
    });

    if (!variant) return;

    const stock = await prisma.stockLevel.aggregate({
      where: { variantId },
      _sum: { qtyOnHand: true, qtyReserved: true }
    });

    const qty = (stock._sum.qtyOnHand || 0) - (stock._sum.qtyReserved || 0);

    return RustClient.search.upsert({
      variant_id: variant.id,
      product_id: variant.productId,
      title: variant.product.title,
      description: variant.product.description || '',
      brand_name: variant.product.brand?.name || 'Generic',
      category_id: variant.product.categoryId,
      category_name: variant.product.category.name,
      seller_id: variant.product.sellerId,
      seller_name: variant.product.seller.businessName,
      price: variant.price.toNumber(),
      compare_price: variant.comparePrice?.toNumber() || 0,
      discount_pct: variant.comparePrice ? Math.round(((variant.comparePrice.toNumber() - variant.price.toNumber()) / variant.comparePrice.toNumber()) * 100) : 0,
      rating: variant.product.averageRating ? variant.product.averageRating.toNumber() : 0,
      review_count: variant.product.reviewCount || 0,
      sales_velocity: 0.1,
      is_active: variant.product.status === 'ACTIVE',
      is_in_stock: qty > 0,
      is_flash_sale: false,
      is_official_store: variant.product.seller.status === 'ACTIVE' || false,
      shipping_days: 3,
      attributes: variant.attributes as any || {},
      image_url: variant.product.media[0]?.url || '',
      created_at: variant.createdAt instanceof Date ? variant.createdAt.getTime() : new Date(variant.createdAt).getTime(),
    }).catch(e => console.error('Failed to sync search index:', e));
  }

  async search(filters: any) {
    // 1. Sanitize Search Query
    const q = (filters.search || '').trim().substring(0, 100).replace(/[^\w\s-]/g, '');
    
    // 2. Enforce Strict Pagination Limits
    const limit = Math.min(filters.limit || 20, 50);
    const offset = Math.max(filters.offset || 0, 0);

    try {
      const { advertisingService } = await import('../../../advertising/services/advertising-service');
      const sponsoredProduct = await advertisingService.selectSponsoredResult(q);

      let searchResponse;
      try {
        searchResponse = await RustClient.search.query({
          q,
          category_id: filters.categoryId,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          sort_by: filters.sortBy,
          limit,
          offset,
        });
      } catch (error) {
        console.warn('[SearchManager] Rust Search Service failed, falling back to Prisma:', error);
        return this.fallbackPrismaSearch(q, filters, limit, offset);
      }

      if (searchResponse && searchResponse.results.length > 0) {
        const variantIds = searchResponse.results.map((r: any) => r.variant_id[0]);
        let results = await prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          include: { 
            product: { include: { media: true, brand: true, category: true } }
          }
        });
        
        let sortedResults = variantIds.map((id: string) => results.find(r => r.id === id)).filter(Boolean);

        if (sponsoredProduct) {
          const sponsoredVariant = await prisma.productVariant.findFirst({
            where: { productId: sponsoredProduct.id },
            include: { product: { include: { media: true, brand: true, category: true } } }
          });

          if (sponsoredVariant) {
            (sponsoredVariant as any).isSponsored = true;
            (sponsoredVariant as any).adGroupId = (sponsoredProduct as any).adGroupId;
            sortedResults = [sponsoredVariant, ...sortedResults];
          }
        }

        return {
          results: sortedResults,
          total: (searchResponse.total || results.length) + (sponsoredProduct ? 1 : 0),
          facets: searchResponse.facets
        };
      }
      
      return { results: [], total: 0, facets: {} };
    } catch (e) {
      console.error('SearchManager search failed:', e);
      throw e;
    }
  }

  private async fallbackPrismaSearch(q: string, filters: any, limit: number, offset: number) {
    const fallbackResults = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        product: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        }
      },
      take: limit,
      skip: offset,
      include: { product: { include: { media: true, brand: true, category: true } } },
      orderBy: { salesVelocity: 'desc' }
    });

    return {
      results: fallbackResults,
      total: fallbackResults.length,
      isFallback: true
    };
  }
}

export const searchManager = new SearchManager();
