import { createTRPCRouter, publicProcedure, sellerProcedure, protectedProcedure, rateLimitProcedure, adminProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { productSchema, categorySchema } from "../schemas/index.js";
import { catalogService } from "../services/catalog-service.js";
import { wishlistService } from "../services/wishlist-service.js";
import { catalogImportService } from "../services/catalog-import-service.js";

const sellerService = prisma.seller;
const productService = prisma.product;
const brandService = prisma.brand;
const productQuestionService = prisma.productQuestion;
const productAnswerService = prisma.productAnswer;

const _catalogRouter = createTRPCRouter({
  bulkImport: sellerProcedure
    .input(z.object({ csvContent: z.string().max(1 * 1024 * 1024, "CSV file is too large. Maximum size allowed is 1MB."), warehouseId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await sellerService.findUnique({
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

  getSellerProducts: publicProcedure
    .input(z.object({
      sellerId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return await catalogService.listProducts(input);
    }),

  getProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await productService.findUnique({
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
      const seller = await sellerService.findUnique({
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
      return await brandService.findMany({
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
      const seller = await sellerService.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true }
      });
      if (!seller) throw new Error('NOT_A_SELLER');
      
      // Ensure seller owns the product
      const product = await productService.findUnique({
        where: { id: input.id, sellerId: seller.id }
      });
      if (!product) throw new Error('PRODUCT_NOT_FOUND_OR_NOT_OWNED');

      return await productService.delete({
        where: { id: input.id }
      });
    }),

  getWishlist: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) return { items: [] };
      return await wishlistService.getWishlist(ctx.session.user.id);
    }),

  askQuestion: protectedProcedure
    .input(z.object({
      productId: z.string(),
      text: z.string().min(5).max(500)
    }))
    .mutation(async ({ ctx, input }) => {
      return await productQuestionService.create({
        data: {
          productId: input.productId,
          userId: ctx.session.user.id,
          text: input.text
        }
      });
    }),

  answerQuestion: protectedProcedure
    .input(z.object({
      questionId: z.string(),
      text: z.string().min(2).max(1000)
    }))
    .mutation(async ({ ctx, input }) => {
      const question = await productQuestionService.findUnique({
        where: { id: input.questionId },
        include: { product: true }
      });
      if (!question) throw new Error('QUESTION_NOT_FOUND');

      const seller = await sellerService.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true }
      });

      const isSeller = seller?.id === question.product.sellerId;

      return await productAnswerService.create({
        data: {
          questionId: input.questionId,
          userId: ctx.session.user.id,
          text: input.text,
          isSeller
        }
      });
    }),

  getQuestions: publicProcedure
    .input(z.object({
      productId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().optional()
    }))
    .query(async ({ input }) => {
      const items = await productQuestionService.findMany({
        where: { productId: input.productId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          answers: {
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  autocomplete: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const { redis } = await import('@ecom/shared');
      const query = input.query.toLowerCase();

      // 1. Try Rust search service first
      try {
        const { RustClient } = await import('../../../rust-client.js');
        const results = await RustClient.search.autocomplete(query);
        if (results && results.length > 0) return results;
      } catch (e) {
        console.warn('[Autocomplete] Rust service failed:', e);
      }

      // 2. Fallback to Redis Trie (ZSET)
      // The trie is built nightly in run-workers.ts
      try {
        if (redis) {
          const results = await redis.zrangebylex('autocomplete_trie', `[${query}`, `[${query}\xff`, 'LIMIT', 0, 8);
          if (results && results.length > 0) {
            return results.map((r: string) => r.replace('*', ''));
          }
        }
      } catch (e) {
        console.warn('[Autocomplete] Redis trie query failed:', e);
      }

      // 3. Fallback to SQL database query matching the active product listings
      try {
        const matchingProducts = await productService.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { brand: { name: { contains: query, mode: 'insensitive' } } },
              { category: { name: { contains: query, mode: 'insensitive' } } }
            ]
          },
          select: { title: true },
          take: 8
        });
        if (matchingProducts.length > 0) {
          return Array.from(new Set(matchingProducts.map(p => p.title)));
        }
      } catch (e) {
        console.error('[Autocomplete] Database fallback failed:', e);
      }

      return [];
    }),
});

export const catalogRouter = _catalogRouter;
export type CatalogRouter = typeof _catalogRouter;
