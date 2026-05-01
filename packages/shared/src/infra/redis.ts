import Redis from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6380', {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  })

redis.on('error', (err) => {
  // Swallow connection errors to prevent unhandled crashing
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
