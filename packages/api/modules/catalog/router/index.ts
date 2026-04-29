import { createTRPCRouter, publicProcedure, sellerProcedure } from "../../../trpc";
import { z } from "zod";
import { productSchema, categorySchema } from "../schemas";
import { catalogService } from "../services/catalog-service";

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
      return await catalogService.createProduct(ctx.session.user.id, input);
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
});
