import { createTRPCRouter, protectedProcedure, adminProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { returnService } from "../services/return-service.js";

const returnShipmentService = prisma.returnShipment;
const sellerService = prisma.seller;

const _returnRouter = createTRPCRouter({
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
  
  reject: adminProcedure
    .input(z.object({ returnId: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return await returnService.rejectReturn(input.returnId, input.reason);
    }),

  listPending: adminProcedure.query(async () => {
    return await returnShipmentService.findMany({
      where: { status: 'PENDING' },
      include: { orderLine: { include: { variant: { include: { product: true } } } } }
    });
  }),

  listForSeller: protectedProcedure.query(async ({ ctx }) => {
    const seller = await sellerService.findUnique({
      where: { userId: ctx.session.user.id },
      select: { id: true }
    });
    if (!seller) throw new Error('NOT_A_SELLER');
    return await returnService.listForSeller(seller.id);
  }),
});

export const returnRouter = _returnRouter;
export type ReturnRouter = typeof _returnRouter;
