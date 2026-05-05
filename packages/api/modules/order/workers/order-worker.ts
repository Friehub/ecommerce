import { Worker, Job } from 'bullmq'
import { redis } from '@ecom/shared'
import { prisma } from '@ecom/db'
import { orderService } from '../services/order-service'
import { ledgerService } from '../../revenue/services/ledger-service'

/* 
  DUPLICATE WORKER DISABLED (C03)
  All order worker jobs are now consolidated in /services/event-consumer
*/
/*
export const orderWorker = new Worker('orders', async (job: Job) => {
  ...
}, { connection: redis });
*/
// Export dummy to satisfy imports in run-workers.ts without starting a worker
export const orderWorker = {
  on: () => {},
  close: async () => {},
} as any;

async function handleDisputeAutoEscalate(disputeId: string) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (dispute && dispute.status === 'OPEN') {
    console.log(`Dispute ${disputeId} timed out for seller response. Escalating.`);
    await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'ESCALATED' }
    });
    const { publishEvent } = await import('@ecom/shared');
    await publishEvent('dispute.escalated', { disputeId, reason: 'AUTO_ESCALATION_TIMEOUT' });
  }
}

async function handleFraudReview(orderId: string, verdict: 'PASS' | 'FAIL') {
  if (verdict === 'FAIL') {
    console.log(`Order ${orderId} failed fraud review. Cancelling.`);
    await orderService.updateStatus(orderId, 'CANCELLED');
  } else {
    console.log(`Order ${orderId} passed fraud review.`);
    // Potentially transition to PROCESSING if it was HELD
  }
}

async function handlePaymentTimeout(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order && order.status === 'PENDING_PAYMENT') {
    console.log(`Order ${orderId} timed out for payment. Cancelling.`);
    await orderService.updateStatus(orderId, 'CANCELLED');
  }
}

async function handleEscrowRelease(orderId: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { 
      packages: { 
        include: { 
          lines: true 
        } 
      } 
    } 
  });

  if (order && order.status === 'DELIVERED') {
    console.log(`Releasing escrow for order ${orderId}`);
    
    // Proactively trigger mature escrow release
    await ledgerService.releaseMatureEscrow();

    await orderService.updateStatus(orderId, 'COMPLETED');
  }
}

async function handleShipmentTimeout(orderId: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { packages: true }
  });

  if (order && (order.status === 'PAID' || order.status === 'PROCESSING')) {
    // Check if any package is still PENDING after 24h
    const overduePackages = order.packages.filter(p => p.status === 'PENDING');
    if (overduePackages.length > 0) {
      console.log(`Order ${orderId} has overdue packages. Penalizing sellers.`);
      for (const pkg of overduePackages) {
        await ledgerService.recordPenalty(pkg.sellerId, 500, 'SLA_BREACH_PROCESSING_TIMEOUT');
      }
    }
  }
}
