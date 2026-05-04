import { prisma } from '@ecom/db';
import jwt from 'jsonwebtoken';

export class AuthManager {
  /**
   * Resolves a user session from either a Bearer Token or a Session Cookie.
   */
  async resolveSession(authHeader?: string, cookies?: any) {
    // 1. Try Bearer Token (External Clients)
    if (authHeader?.startsWith('Bearer ')) {
      const user = await this.resolveFromToken(authHeader.slice(7));
      if (user) return { user };
    }

    // 2. Try Session Cookie (Web Client)
    const sessionToken = cookies?.['__Secure-authjs.session-token'] ?? cookies?.['authjs.session-token'];
    if (sessionToken) {
      const user = await this.resolveFromCookie(sessionToken);
      if (user) return { user };
    }

    return null;
  }

  private async resolveFromToken(token: string) {
    const { secretManager } = await import('../../../shared/services/managers/secret-manager');
    const { redis } = await import('@ecom/shared');
    
    const cacheKey = `auth:token:${token.substring(token.length - 10)}`; // Cache by partial token for safety
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const secret = secretManager.jwtSecret;
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, firstName: true, lastName: true }
      });

      if (user) await redis.set(cacheKey, JSON.stringify(user), 'EX', 300);
      return user;
    } catch {
      return null;
    }
  }

  private async resolveFromCookie(tokenHash: string) {
    const { redis } = await import('@ecom/shared');
    const cacheKey = `auth:session:${tokenHash}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const dbSession = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, role: true, firstName: true, lastName: true }
        }
      }
    });

    if (dbSession && dbSession.expiresAt > new Date()) {
      await redis.set(cacheKey, JSON.stringify(dbSession.user), 'EX', 300);
      return dbSession.user;
    }
    return null;
  }
}

export const authManager = new AuthManager();
