import { prisma } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import type { ProductInput, CategoryInput } from '../schemas'

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
        variants: {
          create: data.variants.map(v => ({
            sku: v.sku,
            price: v.price,
            comparePrice: v.comparePrice,
            attributes: v.attributes,
            weightGrams: v.weightGrams,
          }))
        }
      },
      include: { variants: true }
    });

    await publishEvent('product.created', { productId: product.id, sellerId });
    return product;
  },

  async getProductBySlug(slug: string) {
    return cacheService.wrap(`catalog:product:${slug}`, async () => {
      return prisma.product.findUnique({
        where: { slug },
        include: { 
          variants: true, 
          brand: true, 
          category: true,
          media: true,
          seller: true 
        }
      });
    }, 300);
  },

  async listProducts(filters: { categoryId?: string, brandId?: string, search?: string }) {
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
