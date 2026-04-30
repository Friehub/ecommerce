# Rust vs TypeScript: Backend Strategy

---

## Side-by-Side Comparison

| Dimension | TypeScript (Node.js + tRPC + Prisma) | Rust (Axum + SQLx) |
|---|---|---|
| **Memory per process** | 80–500 MB | 15–60 MB |
| **Cold start** | 1–3 seconds | < 100ms |
| **Throughput** | ~20k–50k req/s (I/O bound) | ~200k–500k req/s |
| **CPU-bound tasks** | Blocks the event loop | Native parallelism via Tokio |
| **GC pauses** | Yes — V8 GC causes latency spikes | No GC. Deterministic latency. |
| **Type safety** | Excellent — tRPC gives end-to-end types | Excellent — borrow checker + strong types |
| **ORM quality** | Prisma — best in class: migrations, types, DX | SQLx (raw SQL) or SeaORM (immature). No Prisma equivalent. |
| **Auth ecosystem** | NextAuth, Lucia — fully featured | Must implement JWT/session from scratch |
| **API schema** | tRPC — zero schema drift, auto-typed client | Must write OpenAPI spec + generate client |
| **Time to implement a new endpoint** | 10–30 minutes | 1–3 hours |
| **Error messages** | Clear at runtime | Borrow checker errors confusing initially |
| **Hiring** | Large talent pool | Small, expensive pool |
| **Binary size** | N/A (requires Node.js runtime) | Single self-contained binary (~5–20 MB) |
| **Deployment** | Requires Node.js on server | Copy binary, done |

---

## Where Each Wins

### TypeScript is the Right Choice For:

**Business logic that changes frequently.** Auth flows, seller onboarding, KYC, dispute resolution, coupon validation. These require rapid iteration. Prisma's type-safe migrations and tRPC's instant client generation mean a new feature can be shipped in hours. In Rust the same work takes a day.

**Orchestration code.** Code that calls 4 other services, aggregates data, and returns a response. TypeScript's `async/await` and `Promise.all` are exactly designed for this. Rust can do it but the ergonomics are worse.

**Admin and internal tools.** Low traffic, high logic complexity. TypeScript wins here on pure developer time.

### Rust is the Right Choice For:

**High-concurrency read paths.** Product listing, search, autocomplete. These are called by every user on every page. Rust handles 10x more concurrent requests per MB of RAM.

**Inventory reservation during flash sales.** Correctness under race conditions. Rust's type system makes it impossible to forget to handle the `sold-out` case. The Redis-based atomic reservation in `services/inventory` is already correct and fast.

**Image processing.** CPU-bound. Node.js blocks the event loop. The Rust image-processor is the right call.

**Fraud scoring.** Real-time rule evaluation on every payment. Low latency required. Rust is a natural fit.

**Search indexing and querying.** Tantivy is written in Rust. Running it inside Rust is zero-overhead. Calling it from Node.js adds HTTP serialization cost.

---

## The Verdict: Hybrid is Correct

Your current architecture is already the right answer:

```
┌─────────────────────────────────────────────────────────────┐
│                TypeScript Layer (tRPC + Prisma)              │
│                                                              │
│  Auth  │  Orders  │  Payments  │  Seller Hub  │  Admin       │
│  Dispute  │  Notifications  │  Affiliate  │  Catalog writes  │
│                                                              │
│  → Handles: Business logic, orchestration, admin, infrequent │
│  → Memory: 150–300 MB total for Next.js + API workers        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (calls internally over HTTP)
┌─────────────────────────────────────────────────────────────┐
│                   Rust Layer (Axum)                          │
│                                                              │
│  Search  │  Inventory  │  Fraud  │  Recommendations          │
│  Image Processing  │  Auction  │  Real-time stock            │
│                                                              │
│  → Handles: High-concurrency reads, CPU tasks, latency-crit  │
│  → Memory: ~400 MB total for all 6 services                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Roadmap: Extracting the API from Next.js

The issue is not that TypeScript is wrong. It is that running the API *inside* Next.js wastes memory. The fix is extracting it, not rewriting it in Rust.

### Phase 1 (Now) — Standalone Output
`output: 'standalone'` in `next.config.ts`. Done. Memory drops from 500 MB to 150 MB.

### Phase 2 — Standalone API Server (2–3 days work)

Create `apps/api-server/` — a plain Fastify server that imports `@ecom/api`:

```typescript
// apps/api-server/src/index.ts
import Fastify from 'fastify'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from '@ecom/api'
import { createContext } from './context'

const server = Fastify({ logger: true })

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
})

server.listen({ port: 4000, host: '0.0.0.0' })
```

Next.js changes `NEXT_PUBLIC_API_URL` to point at port 4000. Done.

**Result:** Next.js only runs the React renderer (~80 MB). The API server is a separate process (~120 MB). Total: 200 MB vs former 500 MB. Both scale independently.

### Phase 3 — Rust API for Hot Paths (2–4 weeks work)

Move product listing, search, and cart read endpoints to Axum. These are the highest-traffic routes and the biggest wins:

| Endpoint | Current | After |
|---|---|---|
| `GET /api/products` | Node.js → Postgres | Rust → Postgres |
| `POST /api/cart/add` | Node.js → Redis + Postgres | Rust → Redis + Postgres |
| `GET /api/search` | Node.js → Rust search | Rust → Rust search (no HTTP hop) |

TypeScript API still handles auth, orders, payments. Rust handles reads.

### Phase 4 — Full Rust API + Static Next.js (Optional, 2–3 months)

Full replacement. Next.js generates static HTML at build time. Axum serves static files + all API routes. Zero Node.js in production. Only justified if you are seeing production memory/latency issues that Phase 2 and 3 do not solve.

---

## Real Numbers: Expected Memory After Each Phase

| Phase | Next.js | API | Total |
|---|---|---|---|
| Current | 500 MB | (inside Next.js) | 500 MB |
| Phase 1 (standalone) | 150 MB | (inside Next.js) | 150 MB |
| Phase 2 (split) | 80 MB | 120 MB Node.js | 200 MB |
| Phase 3 (hybrid) | 80 MB | 80 MB Node + 60 MB Rust hot paths | 220 MB |
| Phase 4 (full Rust) | 0 MB | 60 MB Rust | 60 MB |

Phase 2 is the best return on investment. Phase 4 is a full engineering project.
