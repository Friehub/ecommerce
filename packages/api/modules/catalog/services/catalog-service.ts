import { prisma, Prisma } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import type { ProductInput, CategoryInput } from '../schemas/index.js'
import { RustClient } from '../../../rust-client.js'
import { catalogQueryService } from './catalog-query-service.js'
import { createBreaker } from '../../../utils/resilience.js'

const searchUpsertBreaker = createBreaker(
  (data: any) => RustClient.search.upsert(data),
  'search-upsert'
);

const slugify = (text: string) => 
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
export const catalogService = {
  // Delegate all read operations to catalogQueryService
  ...catalogQueryService,

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
        status: 'PENDING_APPROVAL',
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

    const defaultWarehouse = await prisma.warehouse.findFirst({
      orderBy: { name: 'asc' }
    });
    if (!defaultWarehouse) throw new Error('NO_WAREHOUSE_CONFIGURED');

    for (const variant of product.variants) {
      await prisma.stockLevel.create({
        data: {
          variantId: variant.id,
          sellerId,
          warehouseId: defaultWarehouse.id,
          qtyOnHand: data.variants.find(v => v.sku === variant.sku)?.stock || 0,
          qtyReserved: 0,
        }
      });
      await this.syncToSearch(variant.id);
    }

    return product;
  },

  async updateProduct(sellerId: string, productId: string, data: Partial<ProductInput> & { status?: string }) {
    const product = await prisma.product.update({
      where: { id: productId, sellerId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as any
      },
      include: { variants: true }
    });

    await publishEvent('product.updated', { productId, sellerId });

    for (const variant of product.variants) {
      await this.syncToSearch(variant.id);
    }

    return product;
  },

  async updateVariantPrice(variantId: string, newPrice: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!variant) throw new Error('VARIANT_NOT_FOUND');

    const oldPrice = variant.price.toNumber();

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { price: newPrice }
    });

    if (newPrice < oldPrice) {
      const { wishlistService } = await import('./wishlist-service.js');
      await wishlistService.notifyPriceDrops(variantId, oldPrice, newPrice);
    }

    await this.syncToSearch(variantId);

    return updated;
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

    await searchUpsertBreaker.fire({
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
  }
};
