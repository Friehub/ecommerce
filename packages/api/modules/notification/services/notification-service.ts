import { prisma } from '@ecom/db';
import { redis } from '@ecom/shared';
import type { Service } from '../../../types.js'

export const notificationService: Service = {
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
      const notification = await prisma.notificationLog.create({
        data: {
          userId,
          title,
          message,
          type
        }
      });

      // Emit real-time notification via Redis Pub/Sub (picked up by api-server)
      await redis.publish('notifications', JSON.stringify({
        userId,
        notification
      }));
    }

    // 3. Dispatch external via Resend API using standard Fetch
    if (sendEmail) {
      const { config } = await import('../../../config.js');
      const RESEND_API_KEY = config.RESEND_API_KEY;
      const RESEND_FROM_EMAIL = config.RESEND_FROM_EMAIL;

      if (RESEND_API_KEY !== 're_placeholder') {
        try {
          const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
          if (user?.email) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: `Friehub Jumia <${RESEND_FROM_EMAIL}>`,
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

  async listNotifications(userId: string, limit = 20, offset = 0) {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
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
