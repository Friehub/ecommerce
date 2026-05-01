import { prisma } from '@ecom/db';
import { catalogService } from '@ecom/api/modules/catalog/services/catalog-service';
import * as dotenv from 'dotenv';

dotenv.config();

async function fullReindex() {
  console.log('🚀 Starting Full Reindex...');
  
  const totalProducts = await prisma.productVariant.count();
  console.log(`📦 Found ${totalProducts} variants to index.`);

  const batchSize = 100;
  let processed = 0;

  for (let i = 0; i < totalProducts; i += batchSize) {
    const variants = await prisma.productVariant.findMany({
      skip: i,
      take: batchSize,
      select: { id: true }
    });

    console.log(`🔄 Processing batch ${i / batchSize + 1}...`);
    
    await Promise.all(variants.map(v => catalogService.syncToSearch(v.id)));
    
    processed += variants.length;
    console.log(`✅ Progress: ${processed}/${totalProducts}`);
  }

  console.log('✨ Full Reindex Completed!');
  process.exit(0);
}

fullReindex().catch(err => {
  console.error('❌ Reindex failed:', err);
  process.exit(1);
});
