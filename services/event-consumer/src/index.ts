import { Worker } from 'bullmq';
import { redis } from '@ecom/shared/src/infra/redis';
import { catalogService } from '@ecom/api/modules/catalog/services/catalog-service';
import { ledgerService } from '@ecom/api/modules/revenue/services/ledger-service';
import { prisma } from '@ecom/db';
import * as dotenv from 'dotenv';
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

eventWorker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed`);
});

process.on('SIGTERM', async () => {
  console.log('Gracefully shutting down...');
  await eventWorker.close();
  await orderWorker.close();
});
