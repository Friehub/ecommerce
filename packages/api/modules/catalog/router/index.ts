import { createTRPCRouter, publicProcedure, sellerProcedure, protectedProcedure, rateLimitProcedure, adminProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { productSchema, categorySchema } from "../schemas/index.js";
import { catalogService } from "../services/catalog-service.js";
import { wishlistService } from "../services/wishlist-service.js";
import { catalogImportService } from "../services/catalog-import-service.js";

const _catalogRouter = createTRPCRouter({
  bulkImport: sellerProcedure
    .input(z.object({ csvContent: z.string().max(1 * 1024 * 1024, "CSV file is too large. Maximum size allowed is 1MB."), warehouseId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true }
      });
      if (!seller) throw new Error('NOT_A_SELLER');
      return await catalogImportService.enqueueImport(seller.id, input.csvContent, input.warehouseId);
    }),

  getImportStatus: sellerProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return await catalogImportService.getJobStatus(input.jobId);
    }),

  getCategories: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/catalog/categories' } })
    .input(z.void())
    .output(z.any())
    .query(async () => {
      return await catalogService.getCategoryTree();
    }),

  listProducts: rateLimitProcedure
    .meta({ openapi: { method: 'GET', path: '/catalog/products' } })
    .input(z.object({
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      search: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      sortBy: z.string().optional(),
      isGlobal: z.boolean().optional(),
      isOfficial: z.boolean().optional(),
      isExpress: z.boolean().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .output(z.any())
    .query(async ({ input }) => {
      return await catalogService.listProducts(input);
    }),

  getProductById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.product.findUnique({
        where: { id: input.id },
        include: {
          media: true,
          seller: { select: { businessName: true } }
        }
      });
    }),

  getProductBySlug: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/catalog/product/{slug}' } })
    .input(z.object({ slug: z.string() }))
    .output(z.any())
    .query(async ({ input }) => {
      return await catalogService.getProductBySlug(input.slug);
    }),

  createProduct: sellerProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true }
      });
      if (!seller) throw new Error('NOT_A_SELLER');
      return await catalogService.createProduct(seller.id, input);
    }),

  createCategory: adminProcedure
    .input(categorySchema)
    .mutation(async ({ input }) => {
      return await catalogService.createCategory(input);
    }),

  getCategoryBySlug: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/catalog/category/{slug}' } })
    .input(z.object({ slug: z.string() }))
    .output(z.any())
    .query(async ({ input }) => {
      return await catalogService.getCategoryBySlug(input.slug);
    }),

  getBrands: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/catalog/brands' } })
    .input(z.void())
    .output(z.any())
    .query(async () => {
      return await prisma.brand.findMany({
        take: 100, // Safeguard against 10k brands OOM
        orderBy: { name: 'asc' }
      });
    }),

  addToWishlist: protectedProcedure
    .input(z.object({ variantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await wishlistService.addItem(ctx.session.user.id, input.variantId);
    }),

  removeFromWishlist: protectedProcedure
    .input(z.object({ variantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await wishlistService.removeItem(ctx.session.user.id, input.variantId);
    }),

  deleteProduct: sellerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true }
      });
      if (!seller) throw new Error('NOT_A_SELLER');
      
      // Ensure seller owns the product
      const product = await prisma.product.findUnique({
        where: { id: input.id, sellerId: seller.id }
      });
      if (!product) throw new Error('PRODUCT_NOT_FOUND_OR_NOT_OWNED');

      return await prisma.product.delete({
        where: { id: input.id }
      });
    }),

  getWishlist: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) return { items: [] };
      return await wishlistService.getWishlist(ctx.session.user.id);
    }),
});

export const catalogRouter = _catalogRouter as any;
export type CatalogRouter = typeof _catalogRouter;
