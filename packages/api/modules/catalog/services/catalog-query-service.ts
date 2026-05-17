import { prisma } from '@ecom/db'
import { cacheService, redis } from '@ecom/shared'
import { RustClient } from '../../../rust-client.js'

const productService = prisma.product;
const productVariantService = prisma.productVariant;
const productRelationService = prisma.productRelation;
const categoryService = prisma.category;

export const catalogQueryService = {
  async getProductBySlug(slug: string) {
    return cacheService.wrap(`catalog:product:${slug}`, async () => {
      const product = await productService.findUnique({
        where: { slug },
        include: { 
          variants: { include: { stockLevels: true } }, 
          brand: true, 
          category: true,
          media: true,
          seller: true 
        }
      });
 
      if (product) {
        let recommendations: any[] = [];
        try {
          recommendations = await RustClient.recommendations.forProduct(product.id);
        } catch (e: any) {
          console.warn('Rust recommendations failed, using local collaborative filtering:', e.message);
          const relations = await productRelationService.findMany({
            where: { productId: product.id, relationType: 'CO_PURCHASE' },
            orderBy: { score: 'desc' },
            take: 6,
            include: { 
              relatedProduct: { 
                include: { variants: true, media: true, brand: true, category: true } 
              } 
            }
          });
          recommendations = relations.map(r => r.relatedProduct);
        }

        if (recommendations.length === 0) {
          recommendations = await productService.findMany({
            where: { categoryId: product.categoryId, status: 'ACTIVE', id: { not: product.id } },
            include: { variants: true, media: true, brand: true, category: true },
            take: 6,
            orderBy: { createdAt: 'desc' }
          });
        }

        const inventory = product.variants.reduce((total, variant) => {
          return total + variant.stockLevels.reduce((sum, sl) => sum + sl.qtyOnHand - sl.qtyReserved, 0);
        }, 0);

        return { ...product, recommendations, inventory };
      }
 
      return product;
    }, 300);
  },

  async listProducts(filters: { 
    categoryId?: string, 
    brandId?: string, 
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    limit?: number,
    offset?: number,
    sellerId?: string
  }) {
    if (filters.search || filters.sellerId) {
      try {
        const { advertisingService } = await import('../../advertising/services/advertising-service.js');
        const sponsoredProduct = filters.search ? await advertisingService.selectSponsoredResult(filters.search) : null;

        const searchResponse = await RustClient.search.query({
          q: filters.search || '',
          category_id: filters.categoryId,
          seller_id: filters.sellerId,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          sort_by: filters.sortBy,
          limit: filters.limit,
          offset: filters.offset,
        });

        if (searchResponse && searchResponse.results.length > 0) {
           const variantIds = searchResponse.results.map((r: any) => r.variant_id);
           let results = await productVariantService.findMany({
             where: { id: { in: variantIds } },
             include: { 
               product: { include: { media: true, brand: true, category: true } }
             }
           });
           
           let sortedResults = variantIds.map((id: string) => results.find(r => r.id === id)).filter(Boolean);

           if (sponsoredProduct) {
             const sponsoredVariant = await productVariantService.findFirst({
               where: { productId: sponsoredProduct.id },
               include: { product: { include: { media: true, brand: true, category: true } } }
             });

             if (sponsoredVariant) {
               (sponsoredVariant as any).isSponsored = true;
               (sponsoredVariant as any).adGroupId = (sponsoredProduct as any).adGroupId;
               sortedResults = [sponsoredVariant, ...sortedResults];
             }
           }

           const flattenedResults = sortedResults.map(v => ({
             ...v,
             title: v.product.title,
             slug: v.product.slug,
             media: v.product.media,
             brand: v.product.brand,
             category: v.product.category,
             price: v.price.toNumber(),
             comparePrice: v.comparePrice?.toNumber(),
             isExpress: v.product.isExpress,
             isSponsored: (v as any).isSponsored,
             adGroupId: (v as any).adGroupId
           }));

           return {
             results: flattenedResults,
             total: (searchResponse.total || results.length) + (sponsoredProduct ? 1 : 0),
             facets: searchResponse.facets
           };
        }
        
        return { results: [], total: 0, facets: {} };
      } catch (e) {
        console.error('Rust search failed, falling back to cached/local logic:', e);
      }
    }

    const searchKey = filters.search ? `search:v2:${Buffer.from(JSON.stringify(filters)).toString('base64')}` : null;
    if (searchKey) {
      const cached = await redis.get(searchKey);
      if (cached) {
        const { variantIds, total } = JSON.parse(cached);
        if (variantIds.length === 0) return { results: [], total, facets: {} };

        const results = await productVariantService.findMany({
          where: { id: { in: variantIds } },
          include: { product: { include: { media: true, brand: true, category: true } } }
        });
        
        const sorted = variantIds.map((id: string) => results.find(r => r.id === id)).filter(Boolean);
        return {
          results: sorted.map(v => ({
            ...v,
            title: v.product.title,
            slug: v.product.slug,
            media: v.product.media,
            brand: v.product.brand,
            category: v.product.category,
            price: v.price.toNumber(),
            comparePrice: v.comparePrice?.toNumber(),
            isExpress: v.product.isExpress
          })),
          total,
          facets: {}
        };
      }
    }

    const where: any = {
      product: {
        status: 'ACTIVE',
        sellerId: filters.sellerId,
        categoryId: filters.categoryId,
        brandId: filters.brandId,
        ...(filters.search ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ]
        } : {})
      },
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      }
    };

    const [results, total] = await Promise.all([
      productVariantService.findMany({
        where,
        include: { product: { include: { media: true, brand: true, category: true } } },
        orderBy: filters.sortBy === 'price_asc' 
          ? { price: 'asc' } 
          : filters.sortBy === 'price_desc' 
          ? { price: 'desc' } 
          : filters.sortBy === 'popularity'
          ? { product: { reviewCount: 'desc' } }
          : { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      productVariantService.count({ where })
    ]);

    const flattenedResults = results.map(v => ({
      ...v,
      title: v.product.title,
      slug: v.product.slug,
      media: v.product.media,
      brand: v.product.brand,
      category: v.product.category,
      price: v.price.toNumber(),
      comparePrice: v.comparePrice?.toNumber(),
      isExpress: v.product.isExpress
    }));

    if (searchKey) {
      await redis.set(searchKey, JSON.stringify({ 
        variantIds: results.map(v => v.id), 
        total 
      }), 'EX', 600);
    }

    return { results: flattenedResults, total, facets: {} };
  },

  async getCategoryTree() {
    return cacheService.wrap('catalog:category_tree', async () => {
      return categoryService.findMany({
        where: { parentId: null },
        take: 50,
        include: { children: { include: { children: true } } }
      });
    }, 300);
  },

  async getCategoryBySlug(slug: string) {
    return categoryService.findUnique({
      where: { slug },
      include: { children: true }
    });
  }
};
