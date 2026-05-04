import { redis } from '@ecom/shared';

export class LockManager {
  /**
   * Acquire a distributed lock.
   * @param key The resource key to lock.
   * @param ttl Time to live in milliseconds.
   * @returns The lock token if acquired, null otherwise.
   */
  async acquire(key: string, ttl: number = 5000): Promise<string | null> {
    const token = Math.random().toString(36).substring(2);
    const lockKey = `lock:${key}`;
    
    // NX = Only set if not exists, PX = millisecond TTL
    const acquired = await redis.set(lockKey, token, 'PX', ttl, 'NX');
    
    return acquired === 'OK' ? token : null;
  }

  /**
   * Release a distributed lock safely using Lua.
   */
  async release(key: string, token: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await redis.eval(script, 1, lockKey, token);
    return result === 1;
  }

  /**
   * Execute a callback within a distributed lock.
   */
  async withLock<T>(key: string, callback: () => Promise<T>, ttl: number = 5000): Promise<T> {
    const token = await this.acquire(key, ttl);
    if (!token) {
      throw new Error(`LOCK_ACQUISITION_FAILED: ${key}`);
    }

    try {
      return await callback();
    } finally {
      await this.release(key, token);
    }
  }
}

export const lockManager = new LockManager();
