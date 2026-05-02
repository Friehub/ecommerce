import { createTRPCRouter, publicProcedure, sellerProcedure, protectedProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { productSchema, categorySchema } from "../schemas";
import { catalogService } from "../services/catalog-service";
import { wishlistService } from "../services/wishlist-service";

export const catalogRouter = createTRPCRouter({
  getCategories: publicProcedure.query(async () => {
    return await catalogService.getCategoryTree();
  }),

  listProducts: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/catalog/products' } })
    .input(z.object({
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      search: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      sortBy: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .output(z.any())
    .query(async ({ input }) => {
      return await catalogService.listProducts(input);
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
        where: { userId: ctx.session.user.id }
      });
      if (!seller) throw new Error('NOT_A_SELLER');
      return await catalogService.createProduct(seller.id, input);
    }),

  createCategory: publicProcedure // In reality, this should be adminProcedure
    .input(categorySchema)
    .mutation(async ({ input }) => {
      return await catalogService.createCategory(input);
    }),

  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await catalogService.getCategoryBySlug(input.slug);
    }),

  getBrands: publicProcedure.query(async () => {
    return await prisma.brand.findMany({
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

  getWishlist: protectedProcedure
    .query(async ({ ctx }) => {
      return await wishlistService.getWishlist(ctx.session.user.id);
    }),
});
