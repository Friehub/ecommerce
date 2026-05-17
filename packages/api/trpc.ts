import { initTRPC, TRPCError } from '@trpc/server'
import { type OpenApiMeta } from "trpc-openapi";
import superjson from 'superjson'
import { ZodError } from 'zod'
export interface Session {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    image?: string;
  };
  expires: string;
}

export interface TRPCContext {
  session: Session | null;
  req?: Request;
  redis?: any;
  ip?: string;
  sessionId?: string;
}

export const t = initTRPC.context<TRPCContext>().meta<OpenApiMeta>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  if (result.ok) {
    console.log(`[tRPC] ${type} ${path} - OK (${durationMs}ms)`);
  } else {
    // Narrow result to access error safely
    const error = (result as { ok: false; error: any }).error;
    console.error(`[tRPC] ${type} ${path} - ERROR (${durationMs}ms): ${error?.message ?? 'Unknown Error'}`);
  }
  
  return result;
});

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure.use(loggerMiddleware)
export const rateLimitProcedure = publicProcedure.use(async ({ ctx, next, path }) => {
  if (ctx.redis && ctx.ip) {
    try {
      const key = `rl:${path}:${ctx.ip}`;
      const limit = 100; // 100 req/min (Relaxed from 5)
      const window = 60; // 60 seconds

      const pipeline = ctx.redis.multi();
      pipeline.incr(key);
      pipeline.expire(key, window, 'NX'); // Only set expire if not already set
      
      const results = await pipeline.exec();
      const current = results[0][1] as number;

      if (current > limit) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
        });
      }
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      console.error(`[RateLimit] Redis error for ${path}:`, err);
      // Fix BUG-019: Fail open for rate limiting
      return next();
    }
  }
  return next();
});

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "SELLER" && ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const agentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "AGENT" && ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const moderatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "MODERATOR" && ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
