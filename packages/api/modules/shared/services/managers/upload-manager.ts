import { randomBytes } from 'crypto';
import path from 'path';

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

export interface UploadResult {
  url: string;
  key: string;
  mimetype: string;
  size: number;
}

export class UploadManager {
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  async processUpload(file: UploadedFile, folder: string = 'general'): Promise<UploadResult> {
    // 1. Validate File Size
    if (file.size > this.MAX_SIZE) {
      throw new Error('FILE_TOO_LARGE: Max 5MB');
    }

    // 2. Validate MIME Type
    if (!this.ALLOWED_MIMES.includes(file.mimetype)) {
      throw new Error(`INVALID_FILE_TYPE: Allowed types are ${this.ALLOWED_MIMES.join(', ')}`);
    }

    // 3. Generate Unique Filename
    const extension = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
    const uniqueName = `${randomBytes(16).toString('hex')}${extension}`;
    const key = `${folder}/${uniqueName}`;

    // 4. Simulate Storage Upload (e.g. to S3)
    // In a real S3 implementation, we would use the AWS SDK here.
    const storageUrl = process.env.STORAGE_BASE_URL || 'https://storage.jumia-clone.com';
    const finalUrl = `${storageUrl}/${key}`;

    console.log(`[UploadManager] File processed: ${key} (${file.size} bytes)`);

    return {
      url: finalUrl,
      key,
      mimetype: file.mimetype,
      size: file.size
    };
  }
}

export const uploadManager = new UploadManager();
