import { type AppRouter } from "@ecom/api";
import superjson from "superjson";

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser: in production the API server is behind the same Nginx on /api
    // In dev it falls back to Next.js own /api/trpc handler
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  // Server-side rendering: talk to the API server via internal loopback or specified Docker network URL
  if (process.env.NODE_ENV === "production") {
    return process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  const base = getBaseUrl();
  // In production, tRPC lives at /trpc on the API server
  // In development, Next.js still handles /api/trpc internally
  if (process.env.NODE_ENV === "production") {
    return base + "/trpc";
  }
  return base + "/api/trpc";
}
