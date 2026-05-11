import { Worker, Job } from 'bullmq';
import { redis } from '@ecom/shared';
import { prisma } from '@ecom/db';
import { catalogService } from '../services/catalog-service.js';

export const bulkImportWorker = new Worker('bulk-import', async (job: Job) => {
  console.log(`[BulkImportWorker] Starting job ${job.id}`);
  const { sellerId, csvContent, warehouseId } = job.data;

  if (!csvContent) {
    throw new Error('CSV content is required');
  }

  const lines = csvContent.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    await job.updateProgress(100);
    return;
  }

  // Expect columns: title,sku,price,description,comparePrice,ean,stock,brandId,categoryId
  const header = lines[0].toLowerCase();
  const headers = header.split(',').map((h: string) => h.trim());

  const getCol = (headers: string[], row: string[], name: string) => {
    const idx = headers.indexOf(name);
    return idx >= 0 && idx < row.length ? row[idx].trim() : '';
  };

  const parseNum = (val: string) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const rows = lines.slice(1);
  const total = rows.length;
  let processed = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowContent = rows[i];
    // A regex to match CSV with support for quoted strings
    const matches: RegExpMatchArray | null = rowContent.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const row = matches ? matches.map(v => v.replace(/^"|"$/g, '').trim()) : [];

    if (row.length === 0) continue;

    const title = getCol(headers, row, 'title');
    const sku = getCol(headers, row, 'sku');
    const price = parseNum(getCol(headers, row, 'price'));
    const description = getCol(headers, row, 'description');
    const comparePrice = parseNum(getCol(headers, row, 'compareprice'));
    const ean = getCol(headers, row, 'ean');
    const stock = parseInt(getCol(headers, row, 'stock'), 10) || 0;
    const brandId = getCol(headers, row, 'brandid');
    const categoryId = getCol(headers, row, 'categoryid');

    if (!title || !sku || !brandId || !categoryId) {
      console.warn(`[BulkImportWorker] Row ${i + 1} skipped due to missing required fields`);
      continue;
    }

    try {
      // Create product + variant using catalogService logic
      const product = await catalogService.createProduct(sellerId, {
        title,
        description,
        brandId,
        categoryId,
        images: [], // Images not supported via CSV yet
        variants: [{
          sku,
          price,
          comparePrice: comparePrice || undefined,
          stock,
          attributes: {},
          weightGrams: 0
        }]
      });

      // B09: Inventory and search sync are now handled by catalogService.createProduct
      // No extra work needed here.
    } catch (err: any) {
      console.error(`[BulkImportWorker] Row ${i + 1} (${sku}) failed:`, err.message);
    }

    processed++;
    await job.updateProgress(Math.round((processed / total) * 100));
  }

  console.log(`[BulkImportWorker] Job ${job.id} completed. Processed ${processed}/${total} products.`);
}, { connection: redis });
