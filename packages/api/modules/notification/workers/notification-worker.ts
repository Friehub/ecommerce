import { Worker, Job } from 'bullmq';
import { redis } from '@ecom/shared';
import { prisma } from '@ecom/db';
import { notificationService } from '../services/notification-service.js';
import { emailTemplates } from '../services/email-templates.js';

const orderService = prisma.order;
const sellerService = prisma.seller;
const disputeService = prisma.dispute;

export const notificationWorker = new Worker('notification-events', async (job: Job) => {
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
        const order = await orderService.findUnique({
          where: { id: payload.orderId }
        });
        if (order) {
          const template = emailTemplates.PAYMENT_CONFIRMED(payload);
          await notificationService.sendNotification(order.userId, 'ORDER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'order.status_updated': {
        const order = await orderService.findUnique({
          where: { id: payload.orderId }
        });
        if (!order) break;

        if (payload.status === 'SHIPPED') {
          const template = emailTemplates.ORDER_SHIPPED(payload);
          await notificationService.sendNotification(order.userId, 'ORDER_UPDATE', template.subject, template.html);
        } else if (payload.status === 'DELIVERED') {
          const template = emailTemplates.ORDER_DELIVERED(payload);
          await notificationService.sendNotification(order.userId, 'ORDER_UPDATE', template.subject, template.html);
        } else if (payload.status === 'COMPLETED') {
          const template = emailTemplates.ORDER_COMPLETED(payload);
          await notificationService.sendNotification(order.userId, 'ORDER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'refund.processed': {
        const template = emailTemplates.REFUND_PROCESSED(payload);
        await notificationService.sendNotification(payload.userId, 'BILLING_UPDATE', template.subject, template.html);
        break;
      }
      case 'seller.approved': {
        const seller = await sellerService.findUnique({
          where: { id: payload.sellerId }
        });
        if (seller) {
          const template = emailTemplates.SELLER_APPROVED(payload);
          await notificationService.sendNotification(seller.userId, 'SELLER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'seller.suspended': {
        const seller = await sellerService.findUnique({
          where: { id: payload.sellerId }
        });
        if (seller) {
          const template = emailTemplates.SELLER_SUSPENDED(payload);
          await notificationService.sendNotification(seller.userId, 'SELLER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'seller.document_rejected': {
        const seller = await sellerService.findUnique({
          where: { id: payload.sellerId }
        });
        if (seller) {
          const template = emailTemplates.SELLER_DOCUMENT_REJECTED(payload);
          await notificationService.sendNotification(seller.userId, 'SELLER_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'dispute.resolved': {
        const dispute = await disputeService.findUnique({
          where: { id: payload.disputeId }
        });
        if (dispute) {
          const template = emailTemplates.DISPUTE_RESOLVED(payload);
          await notificationService.sendNotification(dispute.buyerId, 'DISPUTE_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'dispute.opened': {
        const dispute = await disputeService.findUnique({
          where: { id: payload.disputeId },
          include: { seller: true }
        });
        if (dispute && dispute.seller) {
          const template = emailTemplates.DISPUTE_OPENED(payload);
          await notificationService.sendNotification(dispute.seller.userId, 'DISPUTE_UPDATE', template.subject, template.html);
        }
        break;
      }
      case 'seller.tier_changed': {
        const seller = await sellerService.findUnique({
          where: { id: payload.sellerId }
        });
        if (seller) {
          const template = emailTemplates.SELLER_TIER_CHANGED(payload);
          await notificationService.sendNotification(seller.userId, 'SELLER_UPDATE', template.subject, template.html);
        }
        break;
      }
    }
  } catch (err: any) {
    console.error(`[NotificationWorker] Failed to process event ${eventType}:`, err.message);
  }
}, { connection: redis });
