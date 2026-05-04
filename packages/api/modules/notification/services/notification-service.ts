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

    // 3. Dispatch external via Resend API
    if (sendEmail) {
      const { secretManager } = await import('../../shared/services/managers/secret-manager');
      const apiKey = secretManager.resendApiKey;
      const fromEmail = secretManager.resendFromEmail;

      if (apiKey !== 're_placeholder') {
        try {
          const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
          if (user?.email) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: `Friehub Jumia <${fromEmail}>`,
                to: [user.email],
                subject: title,
                html: message
              })
            });
          }
        } catch (err: any) {
          console.warn('Could not send email via Resend:', err.message);
        }
      } else {
        console.log(`[STUB/TEST] Sending Email via Resend to user ${userId} | Subject: ${title}`);
      }
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

  async listNotifications(userId: string) {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  },

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notificationLog.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notificationLog.updateMany({
      where: { userId, isRead: false },
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
