import { orderWorker } from '../modules/order/workers/order-worker';
import { notificationWorker } from '../modules/notification/workers/notification-worker';
import { bulkImportWorker } from '../modules/catalog/workers/bulk-import-worker';
import { ledgerService } from '../modules/revenue/services/ledger-service';
import { prisma } from '@ecom/db';
import { affiliateService } from '../modules/affiliate/services/affiliate-service';
import * as cron from 'node-cron';

console.log('🚀 Starting System Workers...');

orderWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

notificationWorker.on('completed', (job) => {
  console.log(`✅ Notification Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Notification Job ${job?.id} failed:`, err);
});


// Daily Escrow Release (runs at 00:30 UTC every day)
cron.schedule('30 0 * * *', async () => {
  console.log('⏳ Running daily escrow release...');
  try {
    const released = await ledgerService.releaseMatureEscrow();
    console.log(`✅ Escrow release complete. Released ${released.count} entries.`);
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

// Hourly Affiliate Commission Confirmation (runs at minute 0 every hour)
cron.schedule('0 * * * *', async () => {
  console.log('⏳ Running hourly affiliate commission confirmation...');
  try {
    const result = await affiliateService.confirmMatureCommissions();
    console.log(`✅ Affiliate commission confirmation complete. Confirmed ${result.count} commissions.`);
  } catch (error) {
    console.error('❌ Affiliate commission confirmation failed:', error);
  }
});

// Nightly Search Sync & Autocomplete Builder (runs at 02:00 UTC every day)
import { catalogService } from '../modules/catalog/services/catalog-service';
import { redis } from '@ecom/shared';

cron.schedule('0 2 * * *', async () => {
  console.log('⏳ Running nightly search sync and autocomplete builder...');
  try {
    // We get all active products
    const variants = await prisma.productVariant.findMany({
      where: { product: { status: 'ACTIVE' } },
      include: { product: true }
    });

    let count = 0;
    for (const variant of variants) {
      // 1. Sync to Rust Search Service
      await catalogService.syncToSearch(variant.id);
      
      // 2. Build Autocomplete Trie in Redis (Prefix indexing)
      const title = variant.product.title.toLowerCase();
      // Generate prefixes: "a", "ap", "app", "appl", "apple"
      for (let i = 1; i <= title.length; i++) {
        const prefix = title.substring(0, i);
        // Using ZADD with score 0 enables lexicographical sorting in Redis
        await redis.zadd('autocomplete_trie', 0, prefix);
      }
      // Add a terminal character '*' to denote a complete word
      await redis.zadd('autocomplete_trie', 0, `${title}*`);
      count++;
    }
    console.log(`✅ Search sync complete. Processed ${count} active variants.`);
  } catch (error) {
    console.error('❌ Search sync failed:', error);
  }
});

// Nightly Fraud Queue Auto-Cleanup (runs at 03:00 UTC every day)
cron.schedule('0 3 * * *', async () => {
  console.log('⏳ Running nightly fraud queue cleanup...');
  try {
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const cancelled = await prisma.order.updateMany({
      where: {
        status: 'FRAUD_REVIEW',
        createdAt: { lte: fortyEightHoursAgo }
      },
      data: {
        status: 'CANCELLED'
      }
    });
    console.log(`✅ Fraud queue cleanup complete. Auto-cancelled ${cancelled.count} suspicious orders.`);
  } catch (error) {
    console.error('❌ Fraud queue cleanup failed:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Stopping workers...');
  await orderWorker.close();
  await notificationWorker.close();
  await bulkImportWorker.close();
  process.exit(0);
});

console.log('✨ Workers are listening for jobs in Redis & Crons are scheduled');
