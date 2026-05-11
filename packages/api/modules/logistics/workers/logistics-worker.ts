// packages/api/modules/logistics/workers/logistics-worker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '@ecom/shared';
import { prisma } from '@ecom/db';
import { logisticsService } from '../services/logistics-service.js';

export const logisticsWorker = new Worker('system-events', async (job: Job) => {
  console.log(`[LogisticsWorker] Received system event job ${job.id} of type ${job.name}`);

  const eventType = job.name;
  const event = job.data;
  const payload = event?.payload;

  if (!payload) return;

  try {
    switch (eventType) {
      case 'order.status_updated': {
        // [B7] Shipment Auto-Creation
        // Triggered when an order moves to PROCESSING
        if (payload.status === 'PROCESSING') {
          const order = await prisma.order.findUnique({
            where: { id: payload.orderId },
            include: { packages: true }
          });

          if (!order) break;

          console.log(`[LogisticsWorker] Auto-creating shipments for order ${order.id}`);
          for (const pkg of order.packages) {
            await logisticsService.createShipment(pkg.id);
          }
        }
        break;
      }
      
      case 'package.status_updated': {
         // Placeholder for other logistics logic (e.g. 3PL sync)
         break;
      }
    }
  } catch (err: any) {
    console.error(`[LogisticsWorker] Failed to process event ${eventType}:`, err.message);
  }
}, { connection: redis });
