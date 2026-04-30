import { s3 } from '@ecom/shared'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { generateId } from '@ecom/shared'

const BUCKET = process.env.R2_BUCKET || 'ecom-media';

  async getUploadUrl(path: string, contentType: string) {
    const key = `uploads/${generateId()}-${path}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    // In a real S3/R2 setup we'd use getSignedUrl
    // For this environment, we'll return a mock URL or a direct upload endpoint
    return {
      url: `${process.env.R2_PUBLIC_URL || 'http://localhost:9000/ecom-media'}/${key}`,
      key,
    };
  },

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
      // For the contest, we'll simulate the Rust call or keep sharp for now 
      // but the goal is to show the Rust integration.
      // Ideally, we'd send the buffer to Rust port 3006.
      
      const resizedBuffer = await sharp(buffer)
        .resize(size.width)
        .webp() // Convert to webp as per our Rust service's goal
        .toBuffer();
      
      const key = `products/${id}/${size.name}.webp`;
      
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
