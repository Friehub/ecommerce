import { queues } from '@ecom/shared';

export const catalogImportService = {
  async enqueueImport(sellerId: string, csvContent: string, warehouseId: string = 'main-wh') {
    const job = await queues.bulkImportQueue.add('process-csv', {
      sellerId,
      csvContent,
      warehouseId
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
