import { createTRPCRouter, publicProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { contentService } from "../services/content-service.js";

const _contentRouter = createTRPCRouter({
  getHeroBanners: publicProcedure.query(async () => {
    return await contentService.getBanners();
  }),

  getRecommendations: publicProcedure.query(async ({ ctx }) => {
    return await contentService.getRecommendations(ctx.session?.user?.id);
  }),

  getCategoryShowcase: publicProcedure.query(async () => {
    return await prisma.category.findMany({
      where: { parentId: null },
      take: 8
    });
  }),
});

export const contentRouter = _contentRouter as any;
export type ContentRouter = typeof _contentRouter;
