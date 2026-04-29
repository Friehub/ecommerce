import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.R2_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
})
