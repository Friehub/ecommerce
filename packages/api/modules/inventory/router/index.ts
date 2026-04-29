import { createTRPCRouter, publicProcedure, adminProcedure } from "../../../trpc";
import { z } from "zod";
import { inventoryService } from "../services/inventory-service";

export const inventoryRouter = createTRPCRouter({
  getAvailableStock: publicProcedure
    .input(z.object({ variantId: z.string() }))
    .query(async ({ input }) => {
      return await inventoryService.syncStockFromDB(input.variantId);
    }),

  reserve: publicProcedure // Internal use or during checkout
    .input(z.object({ variantId: z.string(), quantity: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return await inventoryService.reserveStock(input.variantId, input.quantity);
    }),

  syncAll: adminProcedure.mutation(async () => {
    // Logic to sync all stock from DB to Redis
    return { success: true };
  }),
});
