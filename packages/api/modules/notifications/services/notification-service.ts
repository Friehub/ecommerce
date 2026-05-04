import { prisma } from '@ecom/db';
import { queues } from '@ecom/shared';

// Notification Types
export type NotificationType = 'ORDER_CONFIRMATION' | 'ORDER_SHIPPED' | 'PROMOTION' | 'ACCOUNT_VERIFICATION' | 'SECURITY_ALERT';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: ('EMAIL' | 'IN_APP' | 'WHATSAPP')[];
}

export const notificationService = {
  /**
   * Primary method to send notifications. Checks user preferences and routes to channels.
   */
  async notify(payload: NotificationPayload) {
    const { userId, type } = payload;

    // 1. Fetch user preferences
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } }
    });

    const channels = payload.channels || ['IN_APP', 'EMAIL']; // Default channels

    // 2. Dispatch to channels based on prefs or defaults
    const tasks: Promise<any>[] = [];

    if (channels.includes('IN_APP') && (!prefs || prefs.push)) {
      tasks.push(this.sendInApp(payload));
    }

    if (channels.includes('EMAIL') && (!prefs || prefs.email)) {
      tasks.push(this.sendEmail(payload));
    }

    if (channels.includes('WHATSAPP') && (prefs?.sms)) {
      tasks.push(this.sendWhatsApp(payload));
    }

    await Promise.all(tasks);
  },

  async sendInApp(payload: NotificationPayload) {
    return prisma.notificationLog.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
      }
    });
  },

  async sendEmail(payload: NotificationPayload) {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user?.email) return;

    console.log(`[NotificationService] Sending Email to ${user.email}: ${payload.title}`);
    
    // In production, this would call Resend API
    // We'll push to a queue to keep the API responsive
    await queues.notificationQueue.add('send-email', {
      to: user.email,
      subject: payload.title,
      body: payload.message,
      type: payload.type,
      data: payload.data
    });
  },

  async sendWhatsApp(payload: NotificationPayload) {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user?.phone) return;

    console.log(`[NotificationService] Sending WhatsApp to ${user.phone}: ${payload.title}`);

    await queues.notificationQueue.add('send-whatsapp', {
      to: user.phone,
      message: payload.message,
      type: payload.type
    });
  },

  /**
   * Send a broadcast notification to all active users (Promotions/System Alerts)
   */
  async sendBulk(data: { title: string, message: string, type: NotificationType }) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    console.log(`[NotificationService] Sending bulk notification "${data.title}" to ${users.length} users`);

    for (const user of users) {
      await this.notify({
        userId: user.id,
        type: data.type,
        title: data.title,
        message: data.message,
        channels: ['IN_APP', 'EMAIL'] // Promotions usually go to email too
      });
    }
  }
};
