import { Queue } from 'bullmq'
import { redis } from '@/infra/redis'
import { EventType, BaseEvent } from './types'
import { nanoid } from 'nanoid'

// We'll use a main event queue that distributes to specific handlers
export const eventBusQueue = new Queue('system-events', { 
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  }
})

export async function publishEvent<T>(type: EventType, payload: T, metadata?: Record<string, any>) {
  const event: BaseEvent<T> = {
    id: nanoid(),
    type,
    payload,
    timestamp: Date.now(),
    metadata,
  }

  await eventBusQueue.add(type, event)
  console.log(`[EventBus] Published: ${type} (${event.id})`)
  return event.id
}
