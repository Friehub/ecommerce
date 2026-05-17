import { redis } from '../infra/redis.js'

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      console.warn(`[CacheService] Failed to GET key "${key}" from Redis:`, err.message);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds: number = 300) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err: any) {
      console.warn(`[CacheService] Failed to SET key "${key}" to Redis:`, err.message);
    }
  },

  async delete(key: string) {
    try {
      await redis.del(key);
    } catch (err: any) {
      console.warn(`[CacheService] Failed to DELETE key "${key}" from Redis:`, err.message);
    }
  },

  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    // 1. Try to get cached value
    const cached = await cacheService.get<T>(key);
    if (cached) return cached;

    // 2. Try to acquire stampede lock, but fall back to direct computation on Redis error
    let lockAcquired = false;
    const lockKey = `lock:${key}`;
    try {
      lockAcquired = await redis.set(lockKey, '1', 'EX', 10, 'NX') === 'OK';
    } catch (err: any) {
      console.warn(`[CacheService] Stampede lock failed for "${key}", computing directly:`, err.message);
      return fn(); // Fallback immediately
    }

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
      try {
        await redis.del(lockKey);
      } catch (err: any) {
        console.warn(`[CacheService] Failed to release lock "${lockKey}":`, err.message);
      }
    }
  }
};
