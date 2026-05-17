import { createTRPCRouter, protectedProcedure } from '../../../trpc.js';
import { supportService } from '../services/support-service.js';
import { z } from 'zod';

const _supportRouter = createTRPCRouter({
  getActiveTicket: protectedProcedure
    .query(async ({ ctx }) => {
      return supportService.getOrCreateActiveTicket(ctx.session.user.id);
    }),

  getMessages: protectedProcedure
    .input(z.object({
      ticketId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return supportService.getTicketMessages(input.ticketId, ctx.session.user.id);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      ticketId: z.string(),
      content: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return supportService.sendSupportMessage(
        input.ticketId,
        ctx.session.user.id,
        input.content
      );
    })
});

export const supportRouter = _supportRouter;
export type SupportRouter = typeof _supportRouter;
