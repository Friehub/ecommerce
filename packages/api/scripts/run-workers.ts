import { orderWorker } from '../modules/order/workers/order-worker';
import { ledgerService } from '../modules/revenue/services/ledger-service';
import { prisma } from '@ecom/db';
import * as cron from 'node-cron';

console.log('🚀 Starting System Workers...');

orderWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

// Daily Escrow Release (runs at 00:30 UTC every day)
cron.schedule('30 0 * * *', async () => {
  console.log('⏳ Running daily escrow release...');
  try {
    const released = await ledgerService.releaseMatureEscrow();
    console.log(`✅ Escrow release complete. Released ${released.length} entries.`);
  } catch (error) {
    console.error('❌ Escrow release failed:', error);
  }
});

// Weekly Statement Generation (runs at 01:00 UTC every Monday)
cron.schedule('0 1 * * 1', async () => {
  console.log('⏳ Running weekly statement generation...');
  try {
    const activeSellers = await prisma.seller.findMany({ where: { status: 'ACTIVE' } });
    const now = new Date();
    // Period: past 7 days
    const periodEnd = new Date(now.setUTCHours(0,0,0,0));
    const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const seller of activeSellers) {
      await ledgerService.generateStatement(seller.id, periodStart, periodEnd);
    }
    console.log(`✅ Weekly statements generated for ${activeSellers.length} sellers.`);
  } catch (error) {
    console.error('❌ Weekly statement generation failed:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Stopping workers...');
  await orderWorker.close();
  process.exit(0);
});

console.log('✨ Workers are listening for jobs in Redis & Crons are scheduled');
