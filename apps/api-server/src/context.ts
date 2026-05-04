import { type TRPCContext } from '@ecom/api';
import { authManager } from '@ecom/api'; 
import { type FastifyRequest } from 'fastify';

export async function createContext(opts: {
  req: FastifyRequest;
  redis: any;
}): Promise<TRPCContext> {
  const { req, redis } = opts;
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip;

  // Delegate authentication resolution to AuthManager
  const session = await authManager.resolveSession(
    req.headers.authorization,
    (req as any).cookies
  );

  return {
    session,
    req: req.raw as unknown as Request,
    redis,
    ip,
  };
}
