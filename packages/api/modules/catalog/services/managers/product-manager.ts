import { prisma, Prisma } from '@ecom/db';
import { publishEvent, cacheService } from '@ecom/shared';
import type { ProductInput } from '../../schemas';

const slugify = (text: string) => 
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

export class ProductManager {
  async createProduct(sellerId: string, data: ProductInput) {
    const slug = `${slugify(data.title)}-${Date.now()}`;
    
    return prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        brandId: data.brandId,
        categoryId: data.categoryId,
        sellerId,
        status: process.env.AUTO_APPROVE_PRODUCTS === 'true' ? 'ACTIVE' : 'PENDING_APPROVAL',
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
  }

  async updateProduct(sellerId: string, productId: string, data: Partial<ProductInput> & { status?: string }) {
    const product = await prisma.product.update({
      where: { id: productId, sellerId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as any,
        adminNotes: (data as any).adminNotes
      },
      include: { variants: true }
    });

    await cacheService.delete(`catalog:product:${product.slug}`);
    return product;
  }

  async getProductBySlug(slug: string) {
    const { RustClient } = await import('../../../../rust-client');
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
  }

  async approveProduct(productId: string, adminNotes?: string) {
    const { auditManager } = await import('../../../shared/services/managers/audit-manager');
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: { 
        status: 'ACTIVE',
        adminNotes: adminNotes || 'Approved by admin'
      },
      include: { variants: true }
    });

    await auditManager.log({
      actorId: 'admin', // In production, pass the actual admin ID
      action: 'PRODUCT_APPROVE',
      entityType: 'PRODUCT',
      entityId: productId,
      metadata: { adminNotes }
    });

    return product;
  }

  async rejectProduct(productId: string, reason: string) {
    const { auditManager } = await import('../../../shared/services/managers/audit-manager');

    const product = await prisma.product.update({
      where: { id: productId },
      data: { 
        status: 'REJECTED',
        adminNotes: reason
      },
      include: { variants: true }
    });

    await auditManager.log({
      actorId: 'admin',
      action: 'PRODUCT_REJECT',
      entityType: 'PRODUCT',
      entityId: productId,
      metadata: { reason }
    });

    return product;
  }

  async deleteProduct(productId: string) {
    const product = await prisma.product.delete({
      where: { id: productId },
      include: { variants: true }
    });

    await cacheService.delete(`catalog:product:${product.slug}`);
    return product;
  }
}

export const productManager = new ProductManager();
