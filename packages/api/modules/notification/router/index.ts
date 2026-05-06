import { createTRPCRouter, protectedProcedure } from '../../../trpc.js';
import { UpdatePreferenceSchema, MarkAsReadSchema } from '../schemas/index.js';
import { notificationService } from '../services/notification-service.js';

const _notificationRouter = createTRPCRouter({
  getUnread: protectedProcedure
    .query(async ({ ctx }) => {
      return notificationService.getUnreadNotifications(ctx.session.user.id);
    }),

  markAsRead: protectedProcedure
    .input(MarkAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      return notificationService.markAsRead(ctx.session.user.id, input.notificationId);
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return notificationService.listNotifications(ctx.session.user.id);
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

export const notificationRouter = _notificationRouter as any;
export type NotificationRouter = typeof _notificationRouter;
