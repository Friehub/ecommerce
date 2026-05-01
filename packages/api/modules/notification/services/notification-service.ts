import { prisma } from '@ecom/db';

export const notificationService = {
  async sendNotification(userId: string, type: string, title: string, message: string) {
    // 1. Get preferences
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } }
    });

    // Default to sending push/in-app, assume email is true unless disabled, sms false unless enabled
    const sendEmail = pref ? pref.email : true;
    const sendSms = pref ? pref.sms : false;
    const sendPush = pref ? pref.push : true;

    // 2. Log in app (always do this if push is enabled, or as a general log)
    if (sendPush) {
      await prisma.notificationLog.create({
        data: {
          userId,
          title,
          message,
          type
        }
      });
    }

    // 3. Dispatch external (stubs)
    if (sendEmail) {
      console.log(`[STUB] Sending Email to user ${userId} | Subject: ${title}`);
      // e.g. Resend.sendEmail(...)
    }

    if (sendSms) {
      console.log(`[STUB] Sending SMS to user ${userId} | Msg: ${message}`);
      // e.g. Termii.sendSms(...)
    }
  },

  async getUnreadNotifications(userId: string) {
    return prisma.notificationLog.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notificationLog.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
  },

  async updatePreferences(userId: string, type: string, email: boolean, sms: boolean, push: boolean) {
    return prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      update: { email, sms, push },
      create: { userId, type, email, sms, push }
    });
  }
};
