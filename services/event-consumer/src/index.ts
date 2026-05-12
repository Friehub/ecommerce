import { Worker } from 'bullmq';
import { redis } from '@ecom/shared';
import { catalogService, ledgerService, orderService } from '@ecom/api';
import { prisma } from '@ecom/db';
import * as dotenv from 'dotenv';
import { startMetricsServer, orderProcessingLatency } from './metrics.js';
import { setupCronJobs } from './cron.js';

dotenv.config();

console.log('🚀 Event Consumer Service starting...');

// Start metrics server
startMetricsServer(Number(process.env.METRICS_PORT) || 9090);

// Setup cron jobs
setupCronJobs().catch(console.error);

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

      case 'shipment.status_updated': {
        const { shipmentId, status } = event.payload;
        if (status === 'FAILED') {
          console.log(`[Logistics] Shipment ${shipmentId} FAILED. Notifying admin.`);
          // Escalation logic: Create an admin notification/audit log
          await prisma.eventLog.create({
            data: {
              topic: 'LOGISTICS_FAILURE',
              payload: { shipmentId, status, severity: 'HIGH' }
            }
          });
        }
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
  console.log(`[OrderWorker] Processing: ${job.name} (${job.id})`);

  try {
    switch (job.name) {
      case 'sla-payment-timeout': {
        const orderId = job.data.orderId;
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.status === 'PENDING_PAYMENT') {
          console.log(`[Timeout] Order ${orderId} timed out for payment. Cancelling.`);
          await orderService.updateStatus(orderId, 'CANCELLED');
        }
        break;
      }

      case 'escrow-release': {
        const orderId = job.data.orderId;
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && (order.status === 'DELIVERED' || order.status === 'COMPLETED')) {
          console.log(`[Settlement] Releasing escrow for order ${orderId}`);
          await ledgerService.releaseEscrowByOrder(orderId);
          if (order.status === 'DELIVERED') {
            await orderService.updateStatus(orderId, 'COMPLETED');
          }
        }
        break;
      }

      case 'sla-shipment-timeout': {
        const orderId = job.data.orderId;
        const order = await prisma.order.findUnique({ 
          where: { id: orderId },
          include: { packages: true }
        });

        if (order && (order.status === 'PAID' || order.status === 'PROCESSING')) {
          const overduePackages = order.packages.filter(p => p.status === 'PENDING');
          if (overduePackages.length > 0) {
            console.log(`[SLA] Order ${orderId} has overdue packages. Penalizing.`);
            for (const pkg of overduePackages) {
              await ledgerService.recordPenalty(pkg.sellerId, 500, 'SLA_BREACH_PROCESSING_TIMEOUT');
            }
          }
        }
        break;
      }

      case 'fraud-review': {
        const { orderId, verdict } = job.data;
        if (verdict === 'FAIL') {
          console.log(`[Fraud] Order ${orderId} failed fraud review. Cancelling.`);
          await orderService.updateStatus(orderId, 'CANCELLED');
        }
        break;
      }

      case 'dispute-auto-escalate': {
        const { disputeId } = job.data;
        const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
        if (dispute && dispute.status === 'OPEN') {
          console.log(`[Dispute] Dispute ${disputeId} timed out. Escalating.`);
          await prisma.dispute.update({
            where: { id: disputeId },
            data: { status: 'ESCALATED' }
          });
          const { publishEvent } = await import('@ecom/shared');
          await publishEvent('dispute.escalated', { disputeId, reason: 'AUTO_ESCALATION_TIMEOUT' });
        }
        break;
      }

      default:
        console.log(`[OrderWorker] Unhandled job name: ${job.name}`);
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

eventWorker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed`);
});

process.on('SIGTERM', async () => {
  console.log('Gracefully shutting down...');
  const { cronWorker } = await import('./cron.js');
  await eventWorker.close();
  await orderWorker.close();
  await cronWorker.close();
});
