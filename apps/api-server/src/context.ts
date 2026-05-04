import { prisma } from '@ecom/db';
import { type TRPCContext } from '@ecom/api';
import { type FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

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

  // ── 1. Try Authorization header (mobile / external clients) ───
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] }) as any;
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      });
      if (user) {
        return {
          session: { user },
          req: req.raw as unknown as Request,
          redis,
          ip,
        };
      }
    } catch {
      // Invalid token — fall through to unauthenticated
    }
  }

  // ── 2. Try NextAuth session cookie (web browser) ───────────────
  // NextAuth session token is validated via the DB session table
  const cookies = (req as any).cookies;
  const sessionToken =
    cookies?.['__Secure-authjs.session-token'] ??
    cookies?.['authjs.session-token'];

  if (sessionToken) {
    const dbSession = await prisma.session.findUnique({
      where: { tokenHash: sessionToken },
      include: {
        user: {
          select: { id: true, email: true, role: true, firstName: true, lastName: true },
        },
      },
    });

    if (dbSession && dbSession.expiresAt > new Date()) {
      return {
        session: { user: dbSession.user },
        req: req.raw as unknown as Request,
        redis,
        ip,
      };
    }
  }

  // ── 3. Unauthenticated ─────────────────────────────────────────
  return {
    session: null,
    req: req.raw as unknown as Request,
    redis,
    ip,
  };
}
