import Redis from 'ioredis';
class MockRedis {
    constructor() {
        return new Proxy(this, {
            get(target, prop) {
                if (prop === 'on' || prop === 'off' || prop === 'once') {
                    return () => target;
                }
                if (prop === 'quit' || prop === 'disconnect') {
                    return () => Promise.resolve();
                }
                return (...args) => Promise.resolve(null);
            }
        });
    }
}
const isBuild = typeof window === 'undefined' && (process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.IS_BUILD === 'true' ||
    process.env.BUILDING === 'true');
const globalForRedis = global;
export const redis = globalForRedis.redis ||
    (isBuild
        ? new MockRedis()
        : new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableOfflineQueue: false,
        }));
if (!isBuild && typeof redis.on === 'function') {
    redis.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
    });
}
if (process.env.NODE_ENV !== 'production')
    globalForRedis.redis = redis;
