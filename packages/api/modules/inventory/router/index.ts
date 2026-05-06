import { createTRPCRouter, publicProcedure, adminProcedure } from "../../../trpc.js";
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
    // Logic to sync all stock from DB to Redis
    return { success: true };
  }),
});

export const inventoryRouter = _inventoryRouter as any;
export type InventoryRouter = typeof _inventoryRouter;
