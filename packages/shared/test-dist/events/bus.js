import { Queue } from 'bullmq';
import { redis } from '../infra/redis';
import { nanoid } from 'nanoid';
// Domain-specific queues to prevent worker competition
export const systemQueue = new Queue('system-events', {
    connection: redis,
    defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
});
export const notificationQueue = new Queue('notification-events', {
    connection: redis,
    defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
});
const NOTIFICATION_EVENTS = [
    'order.created',
    'payment.confirmed',
    'order.status_updated',
    'refund.processed',
    'seller.approved',
    'seller.document_rejected',
    'dispute.resolved'
];
export async function publishEvent(type, payload, metadata) {
    const event = {
        id: nanoid(),
        type,
        payload,
        timestamp: Date.now(),
        metadata,
    };
    // Route to notifications if it's a notification event
    if (NOTIFICATION_EVENTS.includes(type)) {
        await notificationQueue.add(type, event);
    }
    else {
        // Everything else goes to system queue (Search sync, etc.)
        await systemQueue.add(type, event);
    }
    console.log(`[EventBus] Published: ${type} (${event.id})`);
    return event.id;
}
