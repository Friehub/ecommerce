import { Queue } from 'bullmq'
import { redis } from '../infra/redis.js'
import { EventType, BaseEvent } from './types.js'
import { nanoid } from 'nanoid'

// Domain-specific queues to prevent worker competition
export const systemQueue = new Queue('system-events', { 
  connection: redis,
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
})

export const notificationQueue = new Queue('notification-events', { 
  connection: redis,
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
})

const NOTIFICATION_EVENTS: EventType[] = [
  'order.created',
  'payment.confirmed',
  'order.status_updated',
  'refund.processed',
  'seller.approved',
  'seller.suspended',
  'seller.status_updated',
  'seller.tier_changed',
  'seller.document_rejected',
  'dispute.resolved'
];

export async function publishEvent<T>(type: EventType, payload: T, metadata?: Record<string, any>) {
  const event: BaseEvent<T> = {
    id: nanoid(),
    type,
    payload,
    timestamp: Date.now(),
    metadata,
  }

  // Route to the appropriate queues
  const isNotificationEvent = NOTIFICATION_EVENTS.includes(type);
  
  if (isNotificationEvent) {
    // Broadcast notification events to both queues. 
    // This ensures Notification workers get it for emails, 
    // AND System workers (Fraud, Logistics, etc.) get it for backend logic.
    await Promise.all([
      notificationQueue.add(type, event),
      systemQueue.add(type, event)
    ]);
  } else {
    // Pure system events (e.g. search sync, internal housekeeping) go only to system queue
    await systemQueue.add(type, event);
  }
  
  console.log(`[EventBus] Published: ${type} (${event.id})`)
  return event.id
}
