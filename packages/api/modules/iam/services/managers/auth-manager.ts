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
    try {
      const secret = process.env.JWT_SECRET!;
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as any;
      
      return prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, firstName: true, lastName: true }
      });
    } catch {
      return null;
    }
  }

  private async resolveFromCookie(tokenHash: string) {
    const dbSession = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, role: true, firstName: true, lastName: true }
        }
      }
    });

    if (dbSession && dbSession.expiresAt > new Date()) {
      return dbSession.user;
    }
    return null;
  }
}

export const authManager = new AuthManager();
