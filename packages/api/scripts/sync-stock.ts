import { inventoryService } from '../modules/inventory/services/inventory-service.js';
import { redis } from '@ecom/shared';

async function run() {
  console.log('🔄 Initiating stock synchronization...');
  try {
    const syncedCount = await inventoryService.syncAllStock();
    console.log(`✅ Stock synchronization successful! Synced ${syncedCount} unique variants.`);
  } catch (error) {
    console.error('❌ Stock synchronization failed:', error);
  } finally {
    await redis.quit();
  }
}

run();
