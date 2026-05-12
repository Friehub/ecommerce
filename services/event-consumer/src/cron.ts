import { Queue, Worker } from 'bullmq';
import { redis } from '@ecom/shared';
import { ledgerService, affiliateService } from '@ecom/api';

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
        
      default:
        console.log(`[CronWorker] Unknown job name: ${job.name}`);
    }
  } catch (error) {
    console.error(`[CronWorker] Error in job ${job.name}:`, error);
    throw error;
  }
}, { connection: redis });
