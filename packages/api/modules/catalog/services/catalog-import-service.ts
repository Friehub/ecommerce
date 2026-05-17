import { queues } from '@ecom/shared';
import { prisma } from '@ecom/db';

const warehouseService = prisma.warehouse;

export const catalogImportService = {
  async enqueueImport(sellerId: string, csvContent: string, warehouseId?: string) {
    let resolvedWarehouseId = warehouseId;
    
    if (!resolvedWarehouseId) {
      const warehouse = await warehouseService.findFirst({ orderBy: { name: 'asc' } });
      if (!warehouse) throw new Error('NO_DEFAULT_WAREHOUSE_CONFIGURED');
      resolvedWarehouseId = warehouse.id;
    }

    const job = await queues.bulkImportQueue.add('process-csv', {
      sellerId,
      csvContent,
      warehouseId: resolvedWarehouseId
    });

    return { jobId: job.id };
  },

  async getJobStatus(jobId: string) {
    const job = await queues.bulkImportQueue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      progress: job.progress,
      failedReason: job.failedReason,
      isCompleted: await job.isCompleted(),
      isFailed: await job.isFailed()
    };
  }
};
