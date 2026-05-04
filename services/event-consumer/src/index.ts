import { Worker } from 'bullmq';
import { redis } from '@ecom/shared/src/infra/redis';
import { catalogService } from '@ecom/api/modules/catalog/services/catalog-service';
import { ledgerService } from '@ecom/api/modules/revenue/services/ledger-service';
import { prisma } from '@ecom/db';
import * as dotenv from 'dotenv';
import { notificationService } from '@ecom/api/modules/notifications/services/notification-service';
import { startMetricsServer, orderProcessingLatency } from './metrics';

dotenv.config();

console.log('🚀 Event Consumer Service starting...');

// Start metrics server
startMetricsServer(Number(process.env.METRICS_PORT) || 9090);

const eventWorker = new Worker('system-events', async job => {
  const event = job.data;
  console.log(`[EventWorker] Processing: ${job.name} (${event.id})`);

  try {
    switch (event.type) {
      case 'product.created':
      case 'product.updated': {
        const productId = event.payload.productId;
        const variants = await prisma.productVariant.findMany({
          where: { productId }
        });
        console.log(`[SearchSync] Syncing ${variants.length} variants for product ${productId}`);
        for (const variant of variants) {
          await catalogService.syncToSearch(variant.id);
        }
        break;
      }

      case 'inventory.updated': {
        const variantId = event.payload.variantId;
        console.log(`[SearchSync] Syncing variant ${variantId} due to inventory update`);
        await catalogService.syncToSearch(variantId);
        break;
      }

      case 'order.created': {
        const { orderId, userId, total, referralLinkId } = event.payload;
        
        // 1. Process Affiliate Commission asynchronously
        if (referralLinkId) {
          const { affiliateService } = await import('@ecom/api/modules/affiliate/services/affiliate-service');
          const link = await prisma.referralLink.findUnique({ where: { id: referralLinkId } });
          if (link) {
            console.log(`[Affiliate] Recording commission for order ${orderId} via link ${referralLinkId}`);
            await affiliateService.recordCommission(link.agentId, orderId, total);
          }
        }

        // 2. Notify User
        await notificationService.notify({
          userId,
          type: 'ORDER_CONFIRMATION',
          title: 'Order Confirmed!',
          message: `Your order #${orderId} for ₦${total} has been received.`,
          data: { orderId }
        });
        break;
      }

      case 'user.created': {
        const { userId, email } = event.payload;
        // Fetch verification token
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.verificationToken) {
          await notificationService.notify({
            userId,
            type: 'ACCOUNT_VERIFICATION',
            title: 'Verify Your Email',
            message: `Please use this code to verify your account: ${user.verificationToken}`,
            data: { token: user.verificationToken }
          });
        }
        break;
      }

      case 'inventory.sold_out': {
        const { variantId } = event.payload;
        console.log(`[SoldOutAlert] Starting fan-out for variant ${variantId}`);

        let cursor: string | undefined;
        const BATCH_SIZE = 500;

        while (true) {
          const items = await prisma.cartItem.findMany({
            where: { variantId },
            take: BATCH_SIZE,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            include: { cart: { select: { userId: true } }, variant: { include: { product: true } } }
          });

          if (items.length === 0) break;

          // 1. Bulk create Notification Logs to save DB IO
          const notificationLogs = items
            .filter(item => item.cart.userId)
            .map(item => ({
              userId: item.cart.userId!,
              title: 'Item Sold Out!',
              message: `The item "${item.variant.product.title}" in your cart is now sold out.`,
              type: 'ORDER_CONFIRMATION'
            }));

          if (notificationLogs.length > 0) {
            await prisma.notificationLog.createMany({ data: notificationLogs });
          }

          // 2. Queue external notifications (Email/WhatsApp)
          for (const item of items) {
            if (item.cart.userId) {
              await notificationService.sendEmail({
                userId: item.cart.userId,
                type: 'ORDER_CONFIRMATION',
                title: 'Item Sold Out!',
                message: `The item "${item.variant.product.title}" in your cart is now sold out. We have removed it for you.`
              });
            }
          }

          cursor = items[items.length - 1].id;
          console.log(`[SoldOutAlert] Processed ${items.length} notifications, moving cursor to ${cursor}`);
        }

        // 3. Final Cleanup: Remove the sold out item from all carts globally
        await prisma.cartItem.deleteMany({ where: { variantId } });
        console.log(`[SoldOutAlert] Cleanup complete for variant ${variantId}`);
        break;
      }

      default:
        console.log(`[EventWorker] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[EventWorker] Error processing job ${job.id}:`, error);
    throw error;
  }
}, { 
  connection: redis,
  concurrency: 5 
});

const orderWorker = new Worker('orders', async job => {
  const end = orderProcessingLatency.startTimer({ job_name: job.name });
  console.log(`[OrderWorker] Processing: ${job.name} for order ${job.data.orderId}`);

  try {
    if (job.name === 'escrow-release') {
      const { orderId } = job.data;
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) return;

      // Only release if still delivered (not returned/cancelled)
      if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {
        console.log(`[Settlement] Releasing escrow for order ${orderId}`);
        await ledgerService.releaseMatureEscrow();
      }
    }
  } catch (error) {
    console.error(`[OrderWorker] Error processing job ${job.id}:`, error);
    throw error;
  } finally {
    end();
  }
}, {
  connection: redis,
  concurrency: 2
});

const notificationWorker = new Worker('notifications', async job => {
  console.log(`[NotificationWorker] Sending ${job.name} to ${job.data.to}`);
  
  try {
    if (job.name === 'send-email') {
      const { to, subject, body } = job.data;
      // ── Integration: RESEND ──────────────────────────────────────
      // In prod: await resend.emails.send({ from: 'Jumia <no-reply@ecom.dev>', to, subject, html: body });
      console.log(`✉️ [EMAIL SENT] To: ${to} | Subject: ${subject}`);
    }

    if (job.name === 'send-whatsapp') {
      const { to, message } = job.data;
      // ── Integration: WHATSAPP (TWILIO/META) ──────────────────────
      // In prod: await twilio.messages.create({ body: message, from: 'whatsapp:+12345', to: `whatsapp:${to}` });
      console.log(`📲 [WHATSAPP SENT] To: ${to} | Msg: ${message}`);
    }
  } catch (error) {
    console.error(`[NotificationWorker] Failed job ${job.id}:`, error);
    throw error;
  }
}, {
  connection: redis,
  concurrency: 10
});

eventWorker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed`);
});

process.on('SIGTERM', async () => {
  console.log('Gracefully shutting down...');
  await eventWorker.close();
  await orderWorker.close();
  await notificationWorker.close();
});
