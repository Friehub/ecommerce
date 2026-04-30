import { Worker, Job } from 'bullmq'
import { redis } from '@ecom/shared'
import { prisma } from '@ecom/db'
import { orderService } from '../services/order-service'
import { ledgerService } from '../../revenue/services/ledger-service'

export const orderWorker = new Worker('orders', async (job: Job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);

  switch (job.name) {
    case 'sla-payment-timeout':
      await handlePaymentTimeout(job.data.orderId);
      break;
    case 'escrow-release':
      await handleEscrowRelease(job.data.orderId);
      break;
    case 'sla-shipment-timeout':
      await handleShipmentTimeout(job.data.orderId);
      break;
  }
}, { connection: redis });

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
    
    for (const pkg of order.packages) {
      for (const line of pkg.lines) {
        await ledgerService.recordSale(line.id);
      }
    }

    await orderService.updateStatus(orderId, 'COMPLETED');
  }
}

async function handleShipmentTimeout(orderId: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { packages: true }
  });

  if (order && order.status === 'PAID') {
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
