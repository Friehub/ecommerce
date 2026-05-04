import { prisma } from '@ecom/db'
import { publishEvent, cacheService } from '@ecom/shared'
import type { ProductInput, CategoryInput } from '../schemas'
import { RustClient } from '../../../rust-client'
import { productManager } from './managers/product-manager'
import { searchManager } from './managers/search-manager'
import { categoryManager } from './managers/category-manager'

export const catalogService = {
  // ── Product Management ──────────────────────────────────────────
  async createProduct(sellerId: string, data: ProductInput) {
    const product = await productManager.createProduct(sellerId, data);
    await publishEvent('product.created', { productId: product.id, sellerId });

    // 2. Stock & Search Initialization
    await prisma.$transaction([
      prisma.stockLevel.createMany({
        data: product.variants.map(variant => ({
          variantId: variant.id,
          sellerId,
          warehouseId: 'main-wh',
          qtyOnHand: data.variants.find(v => v.sku === variant.sku)?.stock || 0,
          qtyReserved: 0,
        }))
      }),
      // Trigger search syncs in parallel (non-blocking if possible, but let's await for reliability)
    ]);
    
    await Promise.all(product.variants.map(v => searchManager.syncToSearch(v.id)));

    return product;
  },

  async updateProduct(sellerId: string, productId: string, data: Partial<ProductInput> & { status?: string }) {
    const product = await productManager.updateProduct(sellerId, productId, data);
    await publishEvent('product.updated', { productId, sellerId });

    await Promise.all(product.variants.map(v => searchManager.syncToSearch(v.id)));
    return product;
  },

  async approveProduct(productId: string, adminNotes?: string) {
    const product = await productManager.approveProduct(productId, adminNotes);
    await Promise.all(product.variants.map(v => searchManager.syncToSearch(v.id)));
    await publishEvent('product.approved', { productId });
    return product;
  },

  async rejectProduct(productId: string, reason: string) {
    const product = await productManager.rejectProduct(productId, reason);
    await Promise.all(product.variants.map(v => searchManager.syncToSearch(v.id)));
    await publishEvent('product.rejected', { productId, reason });
    return product;
  },

  async deleteProduct(productId: string) {
    const product = await productManager.deleteProduct(productId);
    await publishEvent('product.deleted', { productId });
    return product;
  },

  async updateVariantPrice(variantId: string, newPrice: number) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new Error('VARIANT_NOT_FOUND');

    const oldPrice = variant.price.toNumber();
    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { price: newPrice },
      include: { product: { select: { slug: true } } }
    });

    await cacheService.delete(`catalog:product:${updated.product.slug}`);

    if (newPrice < oldPrice) {
      const { wishlistService } = await import('./wishlist-service');
      await wishlistService.notifyPriceDrops(variantId, oldPrice, newPrice);
    }

    await searchManager.syncToSearch(variantId);
    return updated;
  },

  // ── Search & Retrieval ──────────────────────────────────────────
  async getProductBySlug(slug: string) {
    const product = await productManager.getProductBySlug(slug); // Placeholder if moved or keep local wrapper
    // Actually getProductBySlug was in catalogService, I'll keep it as a wrapper or move it
    return productManager.getProductBySlug(slug); // I should move it to productManager
  },

  async listProducts(filters: any) {
    if (filters.search) {
      return searchManager.search(filters);
    }

    // Standard list logic
    const limit = Math.min(filters.limit || 20, 50);
    const offset = filters.offset || 0;
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
        take: limit,
        skip: offset,
      }),
      prisma.productVariant.count({ where })
    ]);

    return { results, total, facets: {} };
  },

  // ── Category Management ─────────────────────────────────────────
  async createCategory(data: CategoryInput) { return categoryManager.createCategory(data); },
  async getCategoryTree() { return categoryManager.getCategoryTree(); },
  async getCategoryBySlug(slug: string) { return categoryManager.getCategoryBySlug(slug); },
  
  // Wrapper for internal syncs
  async syncToSearch(variantId: string) { return searchManager.syncToSearch(variantId); }
};
