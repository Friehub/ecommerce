import { auth } from "../auth";
import { type TRPCContext } from "@ecom/api";

export const createTRPCContext = async (opts: { req?: Request }): Promise<TRPCContext> => {
  const session = await auth();
  const sessionId = opts.req?.headers.get('x-cart-session-id') ?? undefined;

  return {
    session: session as any,
    sessionId,
    ...opts,
  };
};
