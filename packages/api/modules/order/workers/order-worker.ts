import { Worker, Job } from 'bullmq'
import { redis } from '@ecom/shared'
import { prisma } from '@ecom/db'
import { orderService } from '../services/order-service.js'
import { ledgerService } from '../../revenue/services/ledger-service.js'

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
