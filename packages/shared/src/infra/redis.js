"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
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
exports.redis = globalForRedis.redis ||
    (isBuild
        ? new MockRedis()
        : new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableOfflineQueue: false,
        }));
if (!isBuild && typeof exports.redis.on === 'function') {
    exports.redis.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
    });
}
if (process.env.NODE_ENV !== 'production')
    globalForRedis.redis = exports.redis;
