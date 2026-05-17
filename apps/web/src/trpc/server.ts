import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "@ecom/api";
import { getUrl, transformer } from "./shared";

export const api = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: getUrl(),
      headers() {
        return {
          "x-internal-token": `Bearer ${process.env.INTERNAL_API_TOKEN}`,
        };
      },
    }),
  ],
});
