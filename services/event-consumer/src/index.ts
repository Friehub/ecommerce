import { Worker } from 'bullmq';
import { redis } from '@ecom/shared/src/infra/redis';
import { catalogService } from '@ecom/api/modules/catalog/services/catalog-service';
import { prisma } from '@ecom/db';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Event Consumer Service starting...');

const worker = new Worker('system-events', async job => {
  const event = job.data;
  console.log(`[Worker] Processing: ${job.name} (${event.id})`);

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
        // Potentially update search rank based on sales velocity
        console.log(`[Analytics] Order created: ${event.payload.orderId}`);
        break;
      }

      default:
        console.log(`[Worker] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Worker] Error processing job ${job.id}:`, error);
    throw error; // Let BullMQ handle retry
  }
}, { 
  connection: redis,
  concurrency: 5 
});

worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

process.on('SIGTERM', async () => {
  console.log('Gracefully shutting down...');
  await worker.close();
});
