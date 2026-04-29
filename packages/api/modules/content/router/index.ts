import { createTRPCRouter, publicProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { contentService } from "../services/content-service";

export const contentRouter = createTRPCRouter({
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
