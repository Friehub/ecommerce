import { Queue, Worker } from 'bullmq';
import { redis } from '@ecom/shared';
import { ledgerService, affiliateService, orderService } from '@ecom/api';
import { prisma, OrderStatus } from '@ecom/db';

export const cronQueue = new Queue('cron-jobs', { connection: redis });

export async function setupCronJobs() {
  // 1. Daily Affiliate Commission Confirmation (3.3)
  // Runs every day at midnight
  await cronQueue.add('confirm-commissions', {}, {
    repeat: { cron: '0 0 * * *' }
  });

  // 2. Daily Escrow Release (3.4)
  // Runs every day at 1 AM
  await cronQueue.add('release-escrow', {}, {
    repeat: { cron: '0 1 * * *' }
  });

  // 3. Fraud Queue Cleanup (Blocker 4)
  // Runs every hour to check for stale fraud reviews
  await cronQueue.add('fraud-review-cleanup', {}, {
    repeat: { cron: '0 * * * *' }
  });

  console.log('📅 Cron jobs scheduled');
}

export const cronWorker = new Worker('cron-jobs', async job => {
  console.log(`[CronWorker] Running: ${job.name}`);
  
  try {
    switch (job.name) {
      case 'confirm-commissions':
        const commResult = await affiliateService.confirmMatureCommissions();
        console.log(`[CronWorker] Confirmed ${commResult.count} commissions`);
        break;
        
      case 'release-escrow':
        const escrowResult = await ledgerService.releaseMatureEscrow();
        console.log(`[CronWorker] Released escrow for ${escrowResult.count} entries`);
        break;

      case 'fraud-review-cleanup':
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        const fraudOrders = await prisma.order.findMany({
          where: {
            status: OrderStatus.FRAUD_REVIEW,
            createdAt: { lte: fortyEightHoursAgo }
          },
          select: { id: true }
        });

        console.log(`[CronWorker] Found ${fraudOrders.length} stale fraud orders to cancel`);

        for (const order of fraudOrders) {
          try {
            await orderService.updateStatus(order.id, OrderStatus.CANCELLED);
            console.log(`[CronWorker] Auto-cancelled stale fraud order: ${order.id}`);
          } catch (err: any) {
            console.error(`[CronWorker] Failed to cancel fraud order ${order.id}:`, err.message);
          }
        }
        break;
        
      default:
        console.log(`[CronWorker] Unknown job name: ${job.name}`);
    }
  } catch (error) {
    console.error(`[CronWorker] Error in job ${job.name}:`, error);
    throw error;
  }
}, { connection: redis });
