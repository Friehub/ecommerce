import { Redis } from 'ioredis'

class MockRedis {
  private storage = new Map<string, string>();

  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'on' || prop === 'off' || prop === 'once') {
          return () => target;
        }
        if (prop === 'quit' || prop === 'disconnect') {
          return () => Promise.resolve();
        }
        if (prop === 'get') {
          return (key: string) => Promise.resolve(target.storage.get(key) ?? null);
        }
        if (prop === 'set') {
          return (key: string, value: any) => {
            target.storage.set(key, String(value));
            return Promise.resolve('OK');
          };
        }
        if (prop === 'mset') {
          return (data: Record<string, any>) => {
            Object.entries(data).forEach(([k, v]) => target.storage.set(k, String(v)));
            return Promise.resolve('OK');
          };
        }
        if (prop === 'incrby') {
          return (key: string, amt: number) => {
            const val = parseInt(target.storage.get(key) || '0', 10) + amt;
            target.storage.set(key, String(val));
            return Promise.resolve(val);
          };
        }
        if (prop === 'eval') {
          return () => Promise.resolve(1); // Default to success for Lua scripts in tests
        }
        if (prop === 'pipeline') {
          return () => ({
            zadd: () => {},
            exec: () => Promise.resolve([]),
            length: 0
          });
        }
        return (...args: any[]) => Promise.resolve(null);
      }
    });
  }
}

const isBuild = typeof window === 'undefined' && (
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.IS_BUILD === 'true' ||
  process.env.BUILDING === 'true'
);

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

const globalForRedis = global as unknown as { redis: any }

export const redis =
  globalForRedis.redis ||
  (isBuild || (isTest && !process.env.REDIS_URL)
    ? new MockRedis()
    : new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
      }))

if (!isBuild && typeof (redis as any).on === 'function') {
  (redis as any).on('error', (err: Error) => {
    console.error('[Redis] Connection error:', err.message);
  })
}

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
