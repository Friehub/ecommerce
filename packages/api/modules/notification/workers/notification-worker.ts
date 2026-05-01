import { Worker, Job } from 'bullmq';
import { redis } from '@ecom/shared';
import { prisma } from '@ecom/db';
import { notificationService } from '../services/notification-service';
import { emailTemplates } from '../services/email-templates';

export const notificationWorker = new Worker('system-events', async (job: Job) => {
  console.log(`[NotificationWorker] Received system event job ${job.id} of type ${job.name}`);

  const eventType = job.name;
  const event = job.data;
  const payload = event?.payload;

  if (!payload) return;

  try {
    switch (eventType) {
      case 'order.created': {
        const template = emailTemplates.ORDER_CREATED(payload);
        await notificationService.sendNotification(payload.userId, 'ORDER_UPDATE', template.subject, template.html);
        break;
      }
      case 'payment.confirmed': {
        // Resolve user id from the order
        const order = await prisma.order.findUnique({
          where: { id: payload.orderId }
        });
        if (order) {
          const template = emailTemplates.PAYMENT_CONFIRMED(payload);
          await notificationService.sendNotification(order.userId, 'ORDER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'order.status_updated': {
        if (payload.status === 'SHIPPED') {
          const order = await prisma.order.findUnique({
            where: { id: payload.orderId }
          });
          if (order) {
            const template = emailTemplates.ORDER_SHIPPED(payload);
            await notificationService.sendNotification(order.userId, 'ORDER_UPDATE', template.subject, template.html);
          }
        }
        break;
      }
      case 'seller.approved': {
        const seller = await prisma.seller.findUnique({
          where: { id: payload.sellerId }
        });
        if (seller) {
          const template = emailTemplates.SELLER_APPROVED(payload);
          await notificationService.sendNotification(seller.userId, 'SELLER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'seller.document_rejected': {
        const seller = await prisma.seller.findUnique({
          where: { id: payload.sellerId }
        });
        if (seller) {
          const template = emailTemplates.SELLER_DOCUMENT_REJECTED(payload);
          await notificationService.sendNotification(seller.userId, 'SELLER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'dispute.resolved': {
        const dispute = await prisma.dispute.findUnique({
          where: { id: payload.disputeId }
        });
        if (dispute) {
          const template = emailTemplates.DISPUTE_RESOLVED(payload);
          await notificationService.sendNotification(dispute.buyerId, 'DISPUTE_UPDATE', template.subject, template.html);
        }
        break;
      }
    }
  } catch (err: any) {
    console.error(`[NotificationWorker] Failed to process event ${eventType}:`, err.message);
  }
}, { connection: redis });
