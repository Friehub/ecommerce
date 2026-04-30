import { orderWorker } from '../modules/order/workers/order-worker';

console.log('🚀 Starting System Workers...');

orderWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Stopping workers...');
  await orderWorker.close();
  process.exit(0);
});

console.log('✨ Workers are listening for jobs in Redis');
