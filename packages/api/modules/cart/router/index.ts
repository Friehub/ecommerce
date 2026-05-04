import { createTRPCRouter, publicProcedure, protectedProcedure } from "../../../trpc";
import { z } from "zod";
import { cartService } from "../services/cart-service";

export const cartRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await cartService.getCart(input.sessionId, ctx.session?.user?.id);
    }),

  add: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await cartService.addItem(
        input.sessionId,
        input.variantId,
        input.quantity,
        ctx.session?.user?.id
      );
    }),

  updateQuantity: publicProcedure
    .input(z.object({
      cartItemId: z.string(),
      sessionId: z.string(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await cartService.updateQuantity(
        input.cartItemId, 
        input.quantity, 
        input.sessionId,
        ctx.session?.user?.id
      );
    }),

  remove: publicProcedure
    .input(z.object({ 
      cartItemId: z.string(),
      sessionId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      return await cartService.removeItem(
        input.cartItemId, 
        input.sessionId,
        ctx.session?.user?.id
      );
    }),
});
