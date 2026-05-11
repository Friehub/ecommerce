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
import socketio from 'fastify-socket.io';
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

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

  // ── Socket.io ───────────────────────────────────────────────────
  await server.register(socketio as any, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    }
  });

  server.ready(err => {
    if (err) throw err;

    server.io.on('connection', (socket) => {
      const cookies = socket.handshake.headers.cookie?.split(';').reduce((acc: any, c) => {
        const [k, v] = c.trim().split('=');
        acc[k] = v;
        return acc;
      }, {}) || {};

      const token = socket.handshake.auth.token || cookies['authjs.session-token'] || cookies['__Secure-authjs.session-token'];
      
      if (!token) {
        server.log.warn('Socket connection attempt without token');
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const userId = decoded.sub || decoded.id;
        
        if (userId) {
          socket.join(`user:${userId}`);
          server.log.info(`User ${userId} connected via socket`);
        }
      } catch (e) {
        server.log.error('Socket auth failed');
      }
    });
  });

  // Redis Pub/Sub for cross-instance notifications
  const sub = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  sub.subscribe('notifications', (err) => {
    if (err) server.log.error('Failed to subscribe to Redis notifications channel');
  });

  sub.on('message', (channel, message) => {
    if (channel === 'notifications') {
      try {
        const { userId, notification } = JSON.parse(message);
        server.io.to(`user:${userId}`).emit('notification', notification);
      } catch (e) {
        server.log.error('Failed to process Redis notification message');
      }
    }
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

  // ── Media Upload ──────────────────────────────────────────────────
  const s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  });

  server.post('/api/media/upload', async (req, reply) => {
    // Auth check: check cookie or header
    const cookies = (req.headers.cookie || '').split(';').reduce((acc: any, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {}) || {};

    const token = cookies['authjs.session-token'] || cookies['__Secure-authjs.session-token'] || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.sub || decoded.id;
      
      const { fileName, contentType } = req.body as any;
      if (!fileName || !contentType) {
        return reply.code(400).send({ error: 'Missing file info' });
      }

      const fileExtension = fileName.split('.').pop();
      const key = `uploads/${userId}/${nanoid()}.${fileExtension}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

      return { uploadUrl, publicUrl, key };
    } catch (e) {
      server.log.error(e, 'Media upload failed');
      return reply.code(500).send({ error: 'Failed to generate upload URL' });
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

  // ── Payment Webhooks ─────────────────────────────────────────────
  server.post('/api/webhooks/:provider', async (req, reply) => {
    const { provider } = req.params as { provider: string };
    const signature = req.headers['x-paystack-signature'] || 
                     req.headers['verif-hash'] || 
                     req.headers['monnify-signature'] as string;
    
    if (!signature) {
      return reply.code(400).send({ error: 'Missing signature' });
    }

    try {
      const { webhookService } = await import('@ecom/api');
      // @ts-ignore - rawBody is added by fastify for some plugins or needs to be enabled
      const rawBody = JSON.stringify(req.body); 
      
      await (webhookService as any).processWebhook(provider, rawBody, signature);
      return { status: 'ok' };
    } catch (e: any) {
      server.log.error(e, `Webhook processing failed for ${provider}`);
      return reply.code(400).send({ error: e.message });
    }
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
