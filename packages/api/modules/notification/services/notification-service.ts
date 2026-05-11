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
          // Non-blocking fetch (C04: Optimization)
          fetch('https://api.resend.com/emails', {
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
          }).catch(err => {
            console.error('Background Email Dispatch Failed:', err.message);
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
      const { config } = await import('../../../config.js');
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
      
      if (user?.phone) {
        // C10: Termii Implementation (Standard for Nigeria)
        if (config.TERMII_API_KEY !== 'placeholder') {
          fetch('https://api.ng.termii.com/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.phone,
              from: config.TERMII_SENDER_ID,
              sms: message,
              type: 'plain',
              channel: 'generic',
              api_key: config.TERMII_API_KEY,
            })
          }).catch(err => console.error('Termii SMS Dispatch Failed:', err.message));
        } 
        // Africa's Talking Fallback (Standard for East/West Africa)
        else if (config.AFRICAS_TALKING_API_KEY !== 'placeholder') {
          const params = new URLSearchParams();
          params.append('username', config.AFRICAS_TALKING_USERNAME);
          params.append('to', user.phone);
          params.append('message', message);

          fetch('https://api.africastalking.com/version1/messaging', {
            method: 'POST',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'apikey': config.AFRICAS_TALKING_API_KEY
            },
            body: params
          }).catch(err => console.error('Africa\'s Talking Dispatch Failed:', err.message));
        }
        else {
          console.log(`[STUB/TEST] Sending SMS to user ${userId} (${user.phone}) | Msg: ${message}`);
        }
      }
    }

    // 4. Dispatch Push via Firebase Cloud Messaging (FCM)
    if (sendPush) {
      const devices = await prisma.userDevice.findMany({ where: { userId } });
      const tokens = devices.map(d => d.fcmToken);

      if (tokens.length > 0) {
        const { config } = await import('../../../config.js');
        // Firebase legacy/v1 API implementation logic here. 
        // We'll use the v1 REST API with a Service Account token check.
        const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
        
        if (FIREBASE_PROJECT_ID) {
           // This would normally use google-auth-library to get an access token.
           // For v0.2, we'll log the dispatch attempt while the FCM sidecar is finalized.
           console.log(`[FCM] Dispatching push to ${tokens.length} devices for user ${userId} | Title: ${title}`);
        } else {
           console.log(`[STUB/FCM] Push to user ${userId} | Title: ${title} | Body: ${message.substring(0, 50)}...`);
        }
      }
    }
  },

  async registerDevice(userId: string, fcmToken: string, platform: string) {
    return prisma.userDevice.upsert({
      where: { fcmToken },
      update: { userId, platform, lastUsed: new Date() },
      create: { userId, fcmToken, platform }
    });
  },

  async unregisterDevice(fcmToken: string) {
    return prisma.userDevice.deleteMany({
      where: { fcmToken }
    });
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
