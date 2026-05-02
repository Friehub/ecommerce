import { initTRPC, TRPCError } from '@trpc/server'
import { type OpenApiMeta } from "trpc-openapi";
import superjson from 'superjson'
import { ZodError } from 'zod'
export interface TRPCContext {
  session: any | null;
  req?: Request;
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
  // Foundation for procedure-specific rate limiting
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
