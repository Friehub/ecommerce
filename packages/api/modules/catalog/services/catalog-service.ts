import { prisma } from '@ecom/db'
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
    }

    return product;
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

  async listProducts(filters: { categoryId?: string, brandId?: string, search?: string }) {
    if (filters.search) {
      try {
        const searchResults = await RustClient.search.query(filters.search);
        // If we have search results from Rust, we might want to fetch full product objects from Prisma
        // Or the search results might already contain what we need.
        // For now, let's assume Rust returns IDs or slugs.
        if (searchResults && searchResults.length > 0) {
           const productIds = searchResults.map((r: any) => r.id);
           return prisma.product.findMany({
             where: { id: { in: productIds } },
             include: { variants: true, media: true }
           });
        }
      } catch (e) {
        console.error('Rust search failed, falling back to Prisma:', e);
      }
    }

    return prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        categoryId: filters.categoryId,
        brandId: filters.brandId,
        title: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
      },
      include: { variants: true, media: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createCategory(data: CategoryInput) {
    return prisma.category.create({
      data: {
        ...data,
      }
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
