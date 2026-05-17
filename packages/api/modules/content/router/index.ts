import { createTRPCRouter, publicProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { contentService } from "../services/content-service.js";

const categoryService = prisma.category;

const _contentRouter = createTRPCRouter({
  getHeroBanners: publicProcedure.query(async () => {
    return await contentService.getBanners("HERO");
  }),

  getAdBanners: publicProcedure.query(async () => {
    return await contentService.getBanners("AD");
  }),

  getRecommendations: publicProcedure.query(async ({ ctx }) => {
    return await contentService.getRecommendations(ctx.session?.user?.id);
  }),

  getCategoryShowcase: publicProcedure.query(async () => {
    return await categoryService.findMany({
      where: { parentId: null },
      take: 8
    });
  }),
});

export const contentRouter = _contentRouter;
export type ContentRouter = typeof _contentRouter;
