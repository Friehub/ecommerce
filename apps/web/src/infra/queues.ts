import { Queue } from 'bullmq'
import { redis } from './redis'

export const orderQueue = new Queue('orders', { connection: redis })
export const notificationQueue = new Queue('notifications', { connection: redis })
export const mediaQueue = new Queue('media', { connection: redis })
export const paymentQueue = new Queue('payments', { connection: redis })
export const affiliateQueue = new Queue('affiliate', { connection: redis })
