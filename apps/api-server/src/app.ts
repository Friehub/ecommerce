import fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCOpenApiPlugin } from 'trpc-openapi';
import { appRouter, createContext, secretManager, openApiDocument } from '@ecom/api';
import { uploadRoutes } from './routes/upload-route';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      redact: ['req.headers.authorization', 'password', 'token']
    }
  });

  // 1. Security & Core Plugins
  await server.register(helmet, { contentSecurityPolicy: false });
  await server.register(cors, { origin: true, credentials: true });
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: async (req) => {
      const internalToken = req.headers['x-internal-token'];
      return internalToken === secretManager.internalToken;
    }
  });

  // 2. Swagger / Documentation
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_PUBLIC_SWAGGER === 'true') {
    await server.register(swagger, {
      mode: 'static',
      specification: { document: openApiDocument as any }
    });
    await server.register(swaggerUi, { routePrefix: '/docs' });
  }

  // 3. Health Check
  server.get('/health', async () => ({ status: 'OK', timestamp: new Date().toISOString() }));

  // 4. Native Routes
  await server.register(uploadRoutes);

  // 5. tRPC Plugin
  await server.register(fastifyTRPCOpenApiPlugin, {
    router: appRouter,
    createContext: (opts: any) => createContext({ ...opts, redis: (server as any).redis }),
    basePath: '/api',
  });

  return server;
}
