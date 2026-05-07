import { prisma } from '@ecom/db';
import { type TRPCContext } from '@ecom/api';
import { type FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { decode } from 'next-auth/jwt';

/**
 * Extracts the session from the Authorization header (Bearer JWT)
 * or from the session cookie set by NextAuth on the web app.
 *
 * The web frontend passes the NextAuth session token as a cookie.
 * External API clients (mobile, ERP webhooks) pass a Bearer token.
 */
export async function createContext(opts: {
  req: FastifyRequest;
  redis: any;
}): Promise<TRPCContext> {
  const { req, redis } = opts;
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
  const cookies = (req as any).cookies;
  const cartSessionId = req.headers['x-cart-session-id'] as string || cookies?.['cart-session-id'] || 'anonymous';

  // ── 1. Try Authorization header (mobile / external clients) ───
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] }) as any;
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true },
      });
      if (user && user.isActive) {
        return {
          session: { user, expires: "" },
          req: req.raw as unknown as Request,
          redis,
          ip,
          sessionId: cartSessionId,
        };
      }
    } catch {
      // Invalid token — fall through to unauthenticated
    }
  }

  // ── 2. Try NextAuth session cookie (web browser) ───────────────
  const cookieNames = [
    '__Secure-authjs.session-token', 
    'authjs.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token'
  ];
  
  const nextAuthSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || process.env.AUTH_SECRET;

  for (const cookieName of cookieNames) {
    const sessionToken = cookies?.[cookieName];
    if (sessionToken) {
      try {
        const decoded = await decode({
          token: sessionToken,
          secret: nextAuthSecret!,
          salt: cookieName,
        });

        if (decoded?.sub) {
          const user = await prisma.user.findUnique({
            where: { id: decoded.sub as string },
            select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true },
          });

          if (user && user.isActive) {
            return {
              session: { user, expires: "" },
              req: req.raw as unknown as Request,
              redis,
              ip,
              sessionId: cartSessionId,
            };
          }
        }
      } catch (err) {
        console.warn(`[Context] Failed to decode NextAuth JWT from ${cookieName}:`, err);
      }
    }
  }

  // ── 3. Final Context (Unauthenticated) ─────────────────────────
  return {
    session: null,
    req: req.raw as unknown as Request,
    redis,
    ip,
    sessionId: cartSessionId,
  };
}
