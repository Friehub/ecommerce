import { auth } from "../auth";
import { type TRPCContext } from "@ecom/api";

export const createTRPCContext = async (opts: { req?: Request }): Promise<TRPCContext> => {
  const session = await auth();
  return {
    session,
    ...opts,
  };
};
