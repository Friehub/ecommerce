// packages/api/modules/catalog/workers/recommendation-worker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '@ecom/shared';
import { prisma } from '@ecom/db';

/**
 * Recommendation Engine Worker
 * Implements Collaborative Filtering (Users who bought X also bought Y).
 */
export const recommendationWorker = new Worker('recommendations', async (job: Job) => {
  console.log(`[RecommendationWorker] Running collaborative filtering batch...`);

  try {
    // 1. Fetch all orders with their lines
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] } },
      include: { packages: { include: { lines: true } } }
    });

    const coOccurrence: Record<string, Record<string, number>> = {};

    // 2. Map items bought together
    for (const order of orders) {
      const productIds = new Set<string>();
      for (const pkg of order.packages) {
        for (const line of pkg.lines) {
          // We relate base Products, not specific variants, for broader recommendations
          const variant = await prisma.productVariant.findUnique({
             where: { id: line.variantId },
             select: { productId: true }
          });
          if (variant) productIds.add(variant.productId);
        }
      }

      const ids = Array.from(productIds);
      for (let i = 0; i < ids.length; i++) {
        for (let j = 0; j < ids.length; j++) {
          if (i === j) continue;
          
          const p1 = ids[i];
          const p2 = ids[j];
          
          if (!coOccurrence[p1]) coOccurrence[p1] = {};
          coOccurrence[p1][p2] = (coOccurrence[p1][p2] || 0) + 1;
        }
      }
    }

    // 3. Persist relations to the database
    console.log(`[RecommendationWorker] Updating ${Object.keys(coOccurrence).length} product relation sets...`);
    
    for (const [productId, related] of Object.entries(coOccurrence)) {
      for (const [relatedProductId, score] of Object.entries(related)) {
        await prisma.productRelation.upsert({
          where: {
            productId_relatedProductId_relationType: {
              productId,
              relatedProductId,
              relationType: 'CO_PURCHASE'
            }
          },
          update: { score },
          create: {
            productId,
            relatedProductId,
            score,
            relationType: 'CO_PURCHASE'
          }
        });
      }
    }

    console.log(`[RecommendationWorker] Batch complete.`);
  } catch (err: any) {
    console.error(`[RecommendationWorker] Failed:`, err.message);
  }
}, { connection: redis });
