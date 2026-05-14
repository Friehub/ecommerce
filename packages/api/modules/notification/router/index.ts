import { createTRPCRouter, protectedProcedure, publicProcedure } from '../../../trpc.js';
import { z } from "zod";
import { UpdatePreferenceSchema, MarkAsReadSchema } from '../schemas/index.js';
import { notificationService } from '../services/notification-service.js';

const _notificationRouter = createTRPCRouter({
  getUnread: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) return [];
      return notificationService.getUnreadNotifications(ctx.session.user.id);
    }),

  markAsRead: protectedProcedure
    .input(MarkAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      return notificationService.markAsRead(ctx.session.user.id, input.notificationId);
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      return notificationService.listNotifications(ctx.session.user.id, input.limit, input.offset);
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      return notificationService.markAllAsRead(ctx.session.user.id);
    }),

  updatePreferences: protectedProcedure
    .input(UpdatePreferenceSchema)
    .mutation(async ({ ctx, input }) => {
      return notificationService.updatePreferences(
        ctx.session.user.id,
        input.type,
        input.email,
        input.sms,
        input.push
      );
    }),
});

export const notificationRouter = _notificationRouter;
export type NotificationRouter = typeof _notificationRouter;
