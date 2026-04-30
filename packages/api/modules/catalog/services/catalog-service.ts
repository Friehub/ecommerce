import { prisma, Prisma } from '@ecom/db'
import { publishEvent, cacheService } from '@ecom/shared'
import type { ProductInput, CategoryInput } from '../schemas'
import { RustClient } from '../../../rust-client'

const slugify = (text: string) => 
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

export const catalogService = {
  async createProduct(sellerId: string, data: ProductInput) {
    const slug = `${slugify(data.title)}-${Date.now()}`;
    
    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        brandId: data.brandId,
        categoryId: data.categoryId,
        sellerId,
        status: 'ACTIVE', // Auto-activate for demo
        variants: {
          create: data.variants.map(v => ({
            sku: v.sku,
            price: v.price,
            comparePrice: v.comparePrice,
            attributes: v.attributes,
            weightGrams: v.weightGrams,
          }))
        },
        media: {
          create: data.images?.map((url, i) => ({
            url,
            position: i,
          }))
        }
      },
      include: { variants: true }
    });

    await publishEvent('product.created', { productId: product.id, sellerId });

    // Initialize stock levels for all variants
    for (const variant of product.variants) {
      await prisma.stockLevel.create({
        data: {
          variantId: variant.id,
          sellerId,
          warehouseId: 'main-wh', // Default warehouse from seed
          qtyOnHand: data.variants.find(v => v.sku === variant.sku)?.stock || 0,
          qtyReserved: 0,
        }
      });
      
      // Sync to search index
      await this.syncToSearch(variant.id);
    }

    return product;
  },

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

    await RustClient.search.upsert({
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
      rating: 4.5, // Mock rating for now
      review_count: 10,
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
  },

  async getProductBySlug(slug: string) {
    return cacheService.wrap(`catalog:product:${slug}`, async () => {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { 
          variants: true, 
          brand: true, 
          category: true,
          media: true,
          seller: true 
        }
      });

      if (product) {
        try {
          const recommendations = await RustClient.recommendations.forProduct(product.id);
          return { ...product, recommendations };
        } catch (e) {
          console.warn('Rust recommendations failed:', e);
          return { ...product, recommendations: [] };
        }
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
    offset?: number
  }) {
    if (filters.search) {
      try {
        const searchResponse = await RustClient.search.query({
          q: filters.search,
          category_id: filters.categoryId,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          sort_by: filters.sortBy,
          limit: filters.limit,
          offset: filters.offset,
        });

        if (searchResponse && searchResponse.results.length > 0) {
           const variantIds = searchResponse.results.map((r: any) => r.variant_id[0]);
           const results = await prisma.productVariant.findMany({
             where: { id: { in: variantIds } },
             include: { 
               product: { include: { media: true, brand: true, category: true } }
             }
           });
           
           // Re-sort to match search relevance or requested sort
           return {
             results: variantIds.map((id: string) => results.find(r => r.id === id)).filter(Boolean),
             total: searchResponse.total || results.length,
             facets: searchResponse.facets
           };
        }
        
        return { results: [], total: 0, facets: {} };
      } catch (e) {
        console.error('Rust search failed, falling back to Prisma:', e);
      }
    }

    const where: any = {
      product: {
        status: 'ACTIVE',
        categoryId: filters.categoryId,
        brandId: filters.brandId,
      },
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      }
    };

    const [results, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        include: { product: { include: { media: true, brand: true, category: true } } },
        orderBy: filters.sortBy === 'price_asc' ? { price: 'asc' } : filters.sortBy === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.productVariant.count({ where })
    ]);

    return { results, total, facets: {} };
  },

  async createCategory(data: CategoryInput) {
    const createData: Prisma.CategoryCreateInput = {
      name: data.name,
      slug: data.slug,
      commissionRate: data.commissionRate,
      attributeSchema: data.attributeSchema,
      parent: data.parentId ? { connect: { id: data.parentId } } : undefined
    };
    return prisma.category.create({
      data: createData
    });
  },

  async getCategoryTree() {
    return prisma.category.findMany({
      where: { parentId: null },
      include: { children: { include: { children: true } } }
    });
  },

  async getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: { children: true }
    });
  }
};
