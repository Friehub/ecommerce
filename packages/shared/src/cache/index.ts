import { redis } from '../infra/redis'

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  async set(key: string, value: any, ttlSeconds: number = 3600) {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  },

  async delete(key: string) {
    await redis.del(key);
  },

  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = await cacheService.get<T>(key);
    if (cached) return cached;

    // Stampede protection: only one caller recomputes
    const lockKey = `lock:${key}`;
    const lockAcquired = await redis.set(lockKey, '1', 'EX', 10, 'NX');

    if (!lockAcquired) {
      // Another process is recomputing — wait briefly and return stale/newly-cached
      await new Promise(r => setTimeout(r, 100));
      const retryCached = await cacheService.get<T>(key);
      if (retryCached) return retryCached;
      // If still not there, fall through to recompute anyway as a safeguard
    }

    try {
      const fresh = await fn();
      await cacheService.set(key, fresh, ttlSeconds);
      return fresh;
    } finally {
      await redis.del(lockKey);
    }
  }
};
