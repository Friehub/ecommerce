import { createTRPCRouter, protectedProcedure } from '../../../trpc';
import { UpdatePreferenceSchema, MarkAsReadSchema } from '../schemas';
import { notificationService } from '../services/notification-service';

export const notificationRouter = createTRPCRouter({
  getUnread: protectedProcedure
    .query(async ({ ctx }) => {
      return notificationService.getUnreadNotifications(ctx.session.user.id);
    }),

  markAsRead: protectedProcedure
    .input(MarkAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      return notificationService.markAsRead(ctx.session.user.id, input.notificationId);
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
