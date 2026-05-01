"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const globalForRedis = global;
var isBuild = typeof window === 'undefined' && (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.IS_BUILD === 'true' ||
    process.env.BUILDING === 'true'
);
var MockRedis = function () {
    return new Proxy(this, {
        get: function (target, prop) {
            if (prop === 'on' || prop === 'off' || prop === 'once') {
                return function () { return target; };
            }
            if (prop === 'quit' || prop === 'disconnect') {
                return function () { return Promise.resolve(); };
            }
            return function () { return Promise.resolve(null); };
        }
    });
};
exports.redis = globalForRedis.redis ||
    (isBuild ? new MockRedis() : new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6380', {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false
    }));
if (!isBuild && typeof exports.redis.on === 'function') {
    exports.redis.on('error', function(err) {
        // Swallow connection errors to prevent unhandled crashing
    });
}
if (process.env.NODE_ENV !== 'production')
    globalForRedis.redis = exports.redis;
