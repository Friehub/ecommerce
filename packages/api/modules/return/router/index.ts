import { createTRPCRouter, protectedProcedure, adminProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { returnService } from "../services/return-service";

export const returnRouter = createTRPCRouter({
  initiate: protectedProcedure
    .input(z.object({
      orderLineId: z.string(),
      reason: z.string(),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await returnService.initiateReturn(
        ctx.session.user.id,
        input.orderLineId,
        input.reason
      );
    }),

  approve: adminProcedure
    .input(z.object({ returnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await returnService.approveReturn(input.returnId, ctx.session.user.id);
    }),

  listPending: adminProcedure.query(async () => {
    return await prisma.returnShipment.findMany({
      where: { status: 'PENDING' },
      include: { orderLine: { include: { variant: { include: { product: true } } } } }
    });
  }),
});
