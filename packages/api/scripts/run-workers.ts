import { orderWorker } from '../modules/order/workers/order-worker.js';
import { notificationWorker } from '../modules/notification/workers/notification-worker.js';
import { bulkImportWorker } from '../modules/catalog/workers/bulk-import-worker.js';
import { logisticsWorker } from '../modules/logistics/workers/logistics-worker.js';
import { fraudWorker } from '../modules/order/workers/fraud-worker.js';
import { recommendationWorker } from '../modules/catalog/workers/recommendation-worker.js';
import { ledgerService } from '../modules/revenue/services/ledger-service.js';
import { prisma } from '@ecom/db';
const eventLogService = prisma.eventLog;
const sellerService = prisma.seller;
const productVariantService = prisma.productVariant;
import { affiliateService } from '../modules/affiliate/services/affiliate-service.js';
import { orderService } from '../modules/order/services/order-service.js';
import { sellerDashboardService } from '../modules/seller/services/seller-dashboard-service.js';
import { publishEvent } from '@ecom/shared';
import * as cron from 'node-cron';

console.log('🚀 Starting System Workers...');

orderWorker.on('completed', (job: any) => {
  console.log(`✅ Job ${job.id} completed`);
});

orderWorker.on('failed', (job: any, err: any) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

notificationWorker.on('completed', (job: any) => {
  console.log(`✅ Notification Job ${job.id} completed`);
});

notificationWorker.on('failed', (job: any, err: any) => {
  console.error(`❌ Notification Job ${job?.id} failed:`, err);
});

logisticsWorker.on('completed', (job: any) => {
  console.log(`✅ Logistics Job ${job.id} completed`);
});

logisticsWorker.on('failed', (job: any, err: any) => {
  console.error(`❌ Logistics Job ${job?.id} failed:`, err);
});
 
fraudWorker.on('completed', (job: any) => {
  console.log(`✅ Fraud Job ${job.id} completed`);
});
 
fraudWorker.on('failed', (job: any, err: any) => {
  console.error(`❌ Fraud Job ${job?.id} failed:`, err);
});
 
recommendationWorker.on('completed', (job: any) => {
  console.log(`✅ Recommendation Job ${job.id} completed`);
});
 
recommendationWorker.on('failed', (job: any, err: any) => {
  console.error(`❌ Recommendation Job ${job?.id} failed:`, err);
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
    const activeSellers = await sellerService.findMany({ where: { status: 'ACTIVE' } });
    const now = new Date();
    // E08: Use immutable date creation to avoid mutating 'now' in-place
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
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

// Weekly Seller Tier Upgrade (runs at 01:30 UTC every Sunday)
cron.schedule('30 1 * * 0', async () => {
  console.log('⏳ Running weekly seller tier upgrade evaluation...');
  try {
    const activeSellers = await sellerService.findMany({ 
      where: { status: 'ACTIVE' },
      select: { id: true, tier: true }
    });

    for (const seller of activeSellers) {
      const metrics = await sellerDashboardService.getMetrics(seller.id);
      let targetTier = 'STANDARD';

      if (metrics.gmv >= 5000000 && metrics.performanceScore >= 4.5) {
        targetTier = 'BRAND';
      } else if (metrics.gmv >= 1000000 && metrics.performanceScore >= 4.0) {
        targetTier = 'EXPRESS';
      }

      if (seller.tier !== targetTier) {
        await sellerService.update({
          where: { id: seller.id },
          data: { tier: targetTier as any }
        });

        await publishEvent('seller.tier_changed', {
          sellerId: seller.id,
          oldTier: seller.tier,
          newTier: targetTier
        });
        
        console.log(`[TierUpgrade] Seller ${seller.id} updated: ${seller.tier} -> ${targetTier}`);
      }
    }
    console.log(`✅ Seller tier evaluation complete for ${activeSellers.length} sellers.`);
  } catch (error) {
    console.error('❌ Seller tier upgrade failed:', error);
  }
});

// Nightly Search Sync & Autocomplete Builder (runs at 02:00 UTC every day)
import { catalogService } from '../modules/catalog/services/catalog-service.js';
import { redis } from '@ecom/shared';

cron.schedule('0 2 * * *', async () => {
  console.log('⏳ Running nightly search sync and autocomplete builder...');
  try {
    // We get all active products
    const variants = await productVariantService.findMany({
      where: { product: { status: 'ACTIVE' } },
      include: { product: true }
    });

    let count = 0;
    const pipeline = redis.pipeline();

    for (const variant of variants) {
      // 1. Sync to Rust Search Service
      await catalogService.syncToSearch(variant.id);
      
      // 2. Build Autocomplete Trie in Redis (Prefix indexing)
      // E09: Use pipeline to batch writes and prevent event loop blocking
      const title = variant.product.title.toLowerCase();
      for (let i = 1; i <= title.length; i++) {
        const prefix = title.substring(0, i);
        pipeline.zadd('autocomplete_trie', 0, prefix);
      }
      pipeline.zadd('autocomplete_trie', 0, `${title}*`);
      
      // Flush pipeline every 1000 commands to avoid memory pressure
      if (pipeline.length >= 1000) {
        await pipeline.exec();
      }
      count++;
    }
    await pipeline.exec();
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

    // E10: Use orderService.updateStatus to ensure stock is released correctly
    const fraudOrders = await orderService.findMany({
      where: {
        status: 'FRAUD_REVIEW',
        createdAt: { lte: fortyEightHoursAgo }
      },
      select: { id: true }
    });

    for (const order of fraudOrders) {
      await orderService.updateStatus(order.id, 'CANCELLED');
    }
    console.log(`✅ Fraud queue cleanup complete. Auto-cancelled ${fraudOrders.length} suspicious orders.`);
  } catch (error) {
    console.error('❌ Fraud queue cleanup failed:', error);
  }
});
 
// Nightly Recommendation Engine Update (runs at 04:00 UTC every day)
import { queues } from '@ecom/shared';
cron.schedule('0 4 * * *', async () => {
  console.log('⏳ Triggering nightly recommendation engine update...');
  try {
    await queues.catalogQueue.add('update-recommendations', {});
    console.log('✅ Recommendation update job enqueued.');
  } catch (error) {
    console.error('❌ Failed to enqueue recommendation update:', error);
  }
});

// Outbox Sweep Worker (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  console.log('⏳ Running outbox sweep for PENDING events...');
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingEvents = await eventLogService.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: fiveMinutesAgo }
      },
      take: 50
    });

    if (pendingEvents.length === 0) return;

    console.log(`[Outbox] Found ${pendingEvents.length} PENDING events to retry.`);

    for (const event of pendingEvents) {
      try {
        await publishEvent(event.topic as any, event.payload as any);
        
        await eventLogService.update({
          where: { id: event.id },
          data: { status: 'PUBLISHED' }
        });
        console.log(`✅ Event ${event.id} (${event.topic}) published.`);
      } catch (publishError) {
        console.error(`❌ Failed to re-publish event ${event.id}:`, publishError);
        
        const nextRetryCount = event.retryCount + 1;
        await eventLogService.update({
          where: { id: event.id },
          data: { 
            retryCount: nextRetryCount,
            status: nextRetryCount >= 5 ? 'FAILED' : 'PENDING'
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Outbox sweep failed:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Stopping workers...');
  await orderWorker.close();
  await notificationWorker.close();
  await bulkImportWorker.close();
  await logisticsWorker.close();
  await fraudWorker.close();
  await recommendationWorker.close();
  process.exit(0);
});

console.log('✨ Workers are listening for jobs in Redis & Crons are scheduled');
