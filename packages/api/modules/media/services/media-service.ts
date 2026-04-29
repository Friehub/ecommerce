import { s3 } from '@ecom/shared'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { generateId } from '@ecom/shared'

const BUCKET = process.env.R2_BUCKET || 'ecom-media';

export const mediaService = {
  async processAndUpload(buffer: Buffer, originalName: string) {
    const id = generateId();
    const extension = originalName.split('.').pop() || 'jpg';
    
    // Resize variants (Contest Stub)
    const sizes = [
      { name: 'thumbnail', width: 200 },
      { name: 'medium', width: 600 },
      { name: 'large', width: 1200 },
    ];

    const uploads = await Promise.all(sizes.map(async (size) => {
      const resizedBuffer = await sharp(buffer)
        .resize(size.width)
        .toBuffer();
      
      const key = `products/${id}/${size.name}.${extension}`;
      
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: resizedBuffer,
        ContentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      }));

      return { size: size.name, url: `${process.env.R2_PUBLIC_URL || 'http://localhost:9000/ecom-media'}/${key}` };
    }));

    return { id, uploads };
  }
};
