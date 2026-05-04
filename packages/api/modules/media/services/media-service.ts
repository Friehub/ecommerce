import { s3, generateId } from '@ecom/shared'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { secretManager } from '../../shared/services/managers/secret-manager';

const BUCKET = secretManager.r2Bucket;

export const mediaService = {
  async getUploadUrl(path: string, contentType: string) {
    const key = `uploads/${generateId()}-${path}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    return {
      url: `${secretManager.r2PublicUrl}/${key}`,
      key,
    };
  },

  async processAndUpload(buffer: Buffer, originalName: string) {
    const id = generateId();
    
    const sizes = [
      { name: 'thumbnail', width: 200 },
      { name: 'medium', width: 600 },
      { name: 'large', width: 1200 },
    ];

    const uploads = await Promise.all(sizes.map(async (size) => {
      const resizedBuffer = await sharp(buffer)
        .resize(size.width)
        .webp()
        .toBuffer();
      
      const key = `products/${id}/${size.name}.webp`;
      
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: resizedBuffer,
        ContentType: 'image/webp',
      }));

      return { size: size.name, url: `${secretManager.r2PublicUrl}/${key}` };
    }));

    return { id, uploads };
  }
};
