import { createTRPCRouter, publicProcedure, adminProcedure, sellerProcedure } from "../../../trpc.js";
import { z } from "zod";
import { inventoryService } from "../services/inventory-service.js";

const _inventoryRouter = createTRPCRouter({
  getAvailableStock: publicProcedure
    .input(z.object({ variantId: z.string() }))
    .query(async ({ input }) => {
      return await inventoryService.syncStockFromDB(input.variantId);
    }),

  reserve: publicProcedure // Internal use or during checkout
    .input(z.object({ 
      variantId: z.string(), 
      quantity: z.number().int().positive(),
      sellerId: z.string().optional(),
      warehouseId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      let { sellerId, warehouseId } = input;
      
      if (!sellerId || !warehouseId) {
        const { prisma } = await import('@ecom/db');
        const stockLevel = await prisma.stockLevel.findFirst({
          where: { variantId: input.variantId, qtyOnHand: { gte: input.quantity } }
        });
        if (!stockLevel) throw new Error('STOCK_EXHAUSTED');
        sellerId = stockLevel.sellerId;
        warehouseId = stockLevel.warehouseId;
      }

      return await inventoryService.reserveStock(input.variantId, input.quantity, sellerId, warehouseId);
    }),

  syncAll: adminProcedure.mutation(async () => {
    const { prisma } = await import('@ecom/db');
    const { redis } = await import('@ecom/shared');
    const levels = await prisma.stockLevel.findMany();
    
    for (const level of levels) {
      const available = level.qtyOnHand - level.qtyReserved;
      await redis.set(
        `stock:${level.variantId}`,
        available.toString()
      );
    }
    
    return { synced: levels.length };
  }),

  updateStock: sellerProcedure
    .input(z.object({
      warehouseId: z.string(),
      updates: z.array(z.object({
        variantId: z.string(),
        quantity: z.number().int().nonnegative()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = await import('@ecom/db');
      const seller = await prisma.seller.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true }
      });
      if (!seller) throw new Error('NOT_A_SELLER');

      return await inventoryService.updateStockBatch(seller.id, input.warehouseId, input.updates);
    }),
});

export const inventoryRouter = _inventoryRouter as any;
export type InventoryRouter = typeof _inventoryRouter;
