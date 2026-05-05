import { createTRPCRouter, publicProcedure, protectedProcedure } from "../../../trpc";
import { z } from "zod";
import { cartService } from "../services/cart-service";

export const cartRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({})) // No input needed, uses context
    .query(async ({ ctx }) => {
      return await cartService.getCart(ctx.sessionId!, ctx.session?.user?.id);
    }),

  add: publicProcedure
    .input(z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await cartService.addItem(
        ctx.sessionId!,
        input.variantId,
        input.quantity,
        ctx.session?.user?.id
      );
    }),

  updateQuantity: publicProcedure
    .input(z.object({
      cartItemId: z.string(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await cartService.updateQuantity(
        input.cartItemId, 
        input.quantity, 
        ctx.sessionId!,
        ctx.session?.user?.id
      );
    }),

  remove: publicProcedure
    .input(z.object({ 
      cartItemId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return await cartService.removeItem(
        input.cartItemId, 
        ctx.sessionId!,
        ctx.session?.user?.id
      );
    }),
});
