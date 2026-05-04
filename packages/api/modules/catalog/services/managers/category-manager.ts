import { prisma, Prisma } from '@ecom/db';
import { cacheService } from '@ecom/shared';
import type { CategoryInput } from '../../schemas';

export class CategoryManager {
  async createCategory(data: CategoryInput): Promise<any> {
    try {
      const createData: Prisma.CategoryCreateInput = {
        name: data.name,
        slug: data.slug,
        commissionRate: data.commissionRate,
        attributeSchema: data.attributeSchema,
        parent: data.parentId ? { connect: { id: data.parentId } } : undefined
      };
      const category = await prisma.category.create({
        data: createData
      });

      await cacheService.delete('catalog:category_tree');
      return category;
    } catch (error: any) {
      if (error.code === 'P2002') throw new Error('SLUG_ALREADY_EXISTS');
      throw error;
    }
  }

  async getCategoryTree() {
    return cacheService.wrap('catalog:category_tree', async () => {
      return prisma.category.findMany({
        where: { parentId: null },
        take: 50,
        include: { children: { include: { children: true } } }
      });
    }, 3600);
  }

  async getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: { children: true }
    });
  }
}

export const categoryManager = new CategoryManager();
