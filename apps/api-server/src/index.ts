import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { appRouter, type AppRouter } from '@ecom/api';
import { createContext } from './context';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
  },
  trustProxy: true, // behind Nginx
});

// ── Security & middleware ─────────────────────────────────────────
await server.register(helmet, { contentSecurityPolicy: false });

await server.register(cors, {
  origin: process.env.WEB_URL ?? 'http://localhost:3000',
  credentials: true,
});

await server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.headers['x-forwarded-for'] as string || req.ip,
});

// ── Health check ──────────────────────────────────────────────────
server.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

// ── tRPC ──────────────────────────────────────────────────────────
await server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  useWSS: false,
  trpcOptions: {
    router: appRouter,
    createContext,
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

// ── Graceful shutdown ─────────────────────────────────────────────
const shutdown = async () => {
  server.log.info('Shutting down API server...');
  await server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
