import 'dotenv/config';
import { prisma } from '@ecom/db';
import Redis from 'ioredis';
import { createServer } from './app';
import { secretManager } from '@ecom/api';

async function bootstrap() {
  // 1. Secret Validation (Centralized in SecretManager)
  const redisUrl = secretManager.redisUrl;
  const internalToken = secretManager.internalToken;

  // 2. Create App instance
  const server = await createServer();

  // 3. Attach common infrastructure
  const redis = new Redis(redisUrl);
  (server as any).redis = redis;

  // 4. Lifecycle Hooks
  const shutdown = async (signal: string) => {
    server.log.info({ signal }, 'Shutting down API server...');
    try {
      await server.close();
      await redis.quit();
      await prisma.$disconnect();
      server.log.info('Infrastructure closed successfully');
      process.exit(0);
    } catch (err) {
      server.log.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // 5. Start
  const PORT = Number(process.env.PORT ?? 4000);
  const HOST = process.env.HOST ?? '0.0.0.0';

  try {
    await prisma.$connect();
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 Jumia Clone API running on ${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();
