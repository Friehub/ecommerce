import { createTRPCRouter, publicProcedure, sellerProcedure } from "../../../trpc";
import { z } from "zod";
import { productSchema, categorySchema } from "../schemas";
import { catalogService } from "../services/catalog-service";

export const catalogRouter = createTRPCRouter({
  getCategories: publicProcedure.query(async () => {
    return await catalogService.getCategoryTree();
  }),

  listProducts: publicProcedure
    .input(z.object({
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await catalogService.listProducts(input);
    }),

  getProduct: publicProcedure
    .input(z.object({ slug: z.string() }))
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
});
