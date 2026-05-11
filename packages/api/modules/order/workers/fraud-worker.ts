// packages/api/modules/order/workers/fraud-worker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '@ecom/shared';
import { prisma } from '@ecom/db';
import { orderService } from '../services/order-service.js';
import { RustClient } from '../../../rust-client.js';

/**
 * Fraud Detection Worker
 * Moves fraud checks out of the hot transaction path to improve checkout performance.
 */
export const fraudWorker = new Worker('system-events', async (job: Job) => {
  if (job.name !== 'payment.confirmed') return;

  const { orderId } = job.data.payload;
  console.log(`[FraudWorker] Screening order ${orderId} for fraud...`);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        user: true, 
        packages: { include: { lines: { include: { variant: { include: { product: true } } } } } } 
      }
    });

    if (!order) return;

    // Call Rust Fraud Service (Async)
    let fraudScore = 0;
    try {
      const result = await RustClient.fraud.check({
        orderId: order.id,
        userId: order.userId,
        amount: order.total,
        ip: '0.0.0.0', // Would come from metadata in real prod
        itemCount: order.packages.reduce((acc, p) => acc + p.lines.length, 0)
      });
      fraudScore = result.score;
    } catch (e) {
      console.warn('[FraudWorker] Rust fraud service unavailable, using basic heuristics');
      // Basic heuristic: Large orders from new users
      if (order.total.gt(500000) && !order.user.phoneVerified) {
        fraudScore = 0.8;
      }
    }

    if (fraudScore > 0.7) {
      console.error(`[FraudWorker] FRAUD DETECTED for order ${orderId} (Score: ${fraudScore})`);
      await orderService.updateStatus(order.id, 'FRAUD_REVIEW');
    } else {
      console.log(`[FraudWorker] Order ${orderId} passed fraud check.`);
      // Move to PROCESSING if it was previously held or if we want explicit handoff
      if (order.status === 'PAID') {
         await orderService.updateStatus(order.id, 'PROCESSING');
      }
    }
  } catch (err: any) {
    console.error(`[FraudWorker] Fraud check failed for ${orderId}:`, err.message);
  }
}, { connection: redis });
