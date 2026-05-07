import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { appRouter, type AppRouter } from '@ecom/api';
import { createContext } from './context.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { fastifyTRPCOpenApiPlugin } from 'trpc-openapi';
import { openApiDocument } from '@ecom/api';

import { Redis } from 'ioredis';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
    redact: [
      'req.headers.authorization',
      'req.headers["x-internal-token"]',
      'req.body.password',
      'req.body.email',
      'req.body.phone',
      'req.body.address',
      'req.body.nin',
      'req.body.cvv',
      'res.body.email',
      'res.body.phone',
      'res.body.nin'
    ],
  },
  trustProxy: true, // behind Nginx
});

// ── Security & middleware ─────────────────────────────────────────
async function start() {
  const criticalEnv = ['DATABASE_URL', 'REDIS_URL', 'INTERNAL_API_TOKEN'];
  for (const env of criticalEnv) {
    if (!process.env[env] || process.env[env].includes('placeholder')) {
      server.log.error(`CRITICAL: Environment variable ${env} is missing or insecure!`);
      if (process.env.NODE_ENV === 'production') {
        console.error(`FATAL: ${env} must be set in production. exiting.`);
        process.exit(1);
      }
    }
  }

  const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!jwtSecret || jwtSecret.includes('placeholder')) {
    server.log.error('FATAL: JWT_SECRET must be set to a secure random value. Exiting.');
    process.exit(1);
  }
  process.env.JWT_SECRET = jwtSecret;

  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  await server.register(helmet, { contentSecurityPolicy: false });

  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : [process.env.WEB_URL || 'http://localhost:3000'];

  await server.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });

  await server.register(cookie);

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redis,
    keyGenerator: (req) => (req.headers['x-forwarded-for'] as string) || req.ip,
  });
  
  // ── Swagger & OpenAPI ───────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    await server.register(swagger, {
      mode: 'static',
      specification: {
        document: openApiDocument,
      },
    });

    await server.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  // REST endpoints for tRPC (via trpc-openapi)
  await server.register(fastifyTRPCOpenApiPlugin, {
    router: appRouter,
    createContext: (opts: any) => createContext({ ...opts, redis }),
    basePath: '/api',
  } as any);

  // ── Service-to-Service Auth ──────────────────────────────────────
  server.addHook('preHandler', async (req, reply) => {
    if (req.url.startsWith('/api/internal/')) {
      const internalToken = process.env.INTERNAL_API_TOKEN;
      const clientToken = req.headers['x-internal-token'] || req.headers['authorization'];
      
      if (!internalToken || clientToken !== `Bearer ${internalToken}`) {
        reply.code(401).send({ error: 'Unauthorized internal request' });
        return;
      }
    }
  });

  // ── Health check ──────────────────────────────────────────────────
  server.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

  // ── tRPC ──────────────────────────────────────────────────────────
  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    useWSS: false,
    trpcOptions: {
      router: appRouter,
      createContext: (opts: any) => createContext({ ...opts, redis }),
      onError({ path, error }) {
        if (error.code === 'INTERNAL_SERVER_ERROR') {
          server.log.error({ path, error }, 'tRPC internal error');
        }
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  });

  // ── Start ─────────────────────────────────────────────────────────
  const PORT = Number(process.env.PORT ?? 4000);
  const HOST = process.env.HOST ?? '0.0.0.0';

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`API server running on ${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────
const shutdown = async () => {
  server.log.info('Shutting down API server...');
  await server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
