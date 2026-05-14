# Friehub — Open Source Ecommerce Platform

A production-grade, full-stack ecommerce platform modeled after Jumia. Built as a modular monolith with Next.js, Fastify, and Rust microservices. Ships with a complete buyer marketplace, seller hub, admin portal, logistics tracking, affiliate system, and an advertising engine.

---

## What's Inside

| Surface | Description |
|---|---|
| **Marketplace** | Buyer storefront — catalog, search, cart, checkout, orders |
| **Seller Hub** | Onboarding, listings, inventory, orders, payouts, analytics |
| **Admin Portal** | Platform ops, dispute queue, fraud queue, user management |
| **Affiliate (JForce)** | Referral links, commission tracking, agent tiers |
| **Logistics** | Agent assignment, proof of delivery, pickup stations, returns |
| **Advertising** | Sponsored products, display banners, CPC auction engine |
| **JumiaPay** | Wallet, escrow, Paystack card payments, weekly settlements |

---

## Stack

### TypeScript (Next.js Monolith)

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| API | Fastify + tRPC |
| ORM | Prisma + PostgreSQL |
| Cache / Queue | Redis + BullMQ |
| Auth | NextAuth.js v5 |
| Validation | Zod |
| Payments | Paystack |
| Email | Resend |
| Storage | Cloudflare R2 |

### Rust Microservices

| Service | Stack | Port |
|---|---|---|
| Search | Axum + Tantivy | 3001 |
| Ad Auction | Axum + tonic (gRPC) | 3003 |
| Inventory Reservation | Axum + Redis | 3002 |
| Fraud Detection | Axum + Candle (ML) | 3004 |
| Recommendations | Axum + Qdrant | 3005 |
| Image Processor | Axum + image crate | 3006 |

In development the Rust services are replaced by TypeScript stubs automatically — you only need Rust if you are working on a Rust service.

---

## Architecture

```
apps/
├── web/                   # Next.js — buyer, seller, admin, affiliate, logistics
└── api-server/            # Fastify — tRPC, webhooks, mobile API

services/                  # Rust microservices (Cargo workspace)
├── search/
├── auction/
├── inventory/
├── fraud/
├── recommendations/
└── image-processor/

packages/
├── api/                   # tRPC routers — shared by web and mobile
├── db/                    # Prisma schema and client
├── types/                 # Shared types and Zod schemas
└── config/                # Shared ESLint and TypeScript configs
```

The application is a **modular monolith**: 24 business modules live in one deployable unit, each with strict internal boundaries. Modules communicate only through an event bus (BullMQ). Nothing inside a module is importable from outside it — only its `index.ts` exports are public.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full design rationale.

---

## Local Development

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| Docker | latest | https://docs.docker.com/get-docker/ |
| Rust | stable (optional) | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |

### 1. Clone and install

```bash
git clone https://github.com/your-org/friehub.git
cd friehub
pnpm install
```

### 2. Start infrastructure

```bash
# PostgreSQL + Redis
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432` (db: `ecom_dev`, user: `ecom`, password: `ecom`)
- Redis on `localhost:6379`

### 3. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Minimum required values in `.env.local`:

```env
DATABASE_URL="postgresql://ecom:ecom@localhost:5432/ecom_dev"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Paystack (test keys from dashboard.paystack.com)
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_WEBHOOK_SECRET="..."

# Resend (test mode)
RESEND_API_KEY="re_test_..."

# Cloudflare R2 (or local MinIO — see below)
R2_ENDPOINT="http://localhost:9000"
R2_ACCESS_KEY="minioadmin"
R2_SECRET_KEY="minioadmin"
R2_BUCKET="ecom-media"
```

### 4. Set up the database

```bash
pnpm --filter @ecom/db generate      # generate Prisma client
pnpm --filter @ecom/db migrate dev   # run migrations
pnpm --filter @ecom/db db seed       # seed with demo data
```

The seed creates: 5 sellers, 50 products across 8 categories, buyer accounts, completed orders, reviews, disputes, ad campaigns, and affiliate agents.

### 5. Start the app

```bash
pnpm dev
```

- Web app → http://localhost:3000
- API (Fastify) → http://localhost:4000

### Test accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@ecom.dev | `admin123` |
| Seller | seller@ecom.dev | `seller123` |
| Buyer | buyer@ecom.dev | `buyer123` |
| Delivery Agent | agent@ecom.dev | `agent123` |
| Moderator | mod@ecom.dev | `mod123` |

### Local media storage (optional)

Only needed if testing image uploads:

```bash
docker compose --profile media up -d
# MinIO admin → http://localhost:9001 (minioadmin / minioadmin)
```

```bash
# Create the bucket
docker exec ecom-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec ecom-minio mc mb local/ecom-media
docker exec ecom-minio mc policy set public local/ecom-media
```

### Rust services (optional)

Only needed if you are working on a Rust service. TypeScript stubs are used for all Rust service calls in development by default.

```bash
cd services
cargo build

# Start a specific service
cargo run -p ecom-search
cargo run -p ecom-inventory
```

---

## Common Commands

```bash
# Type check all packages
pnpm typecheck

# Lint
pnpm lint

# Run tests
pnpm test

# Add a Prisma migration after changing schema.prisma
pnpm --filter @ecom/db migrate dev --name <description>

# Reset DB (wipes all data, re-seeds)
pnpm --filter @ecom/db migrate reset

# Rust: check without building
cd services && cargo check

# Rust: run tests
cd services && cargo test
```

---

## Deployment

### Requirements

- A Linux VPS (Ubuntu 22.04+)
- Node.js 20+ and pnpm
- PM2 (`npm i -g pm2`)
- Nginx
- PostgreSQL and Redis (can be managed services)
- SSL certificates (Let's Encrypt via Certbot)

### First-time server setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm and PM2
npm i -g pnpm pm2

# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Environment secrets

Store production secrets outside the repo:

```bash
sudo mkdir -p /etc/friehub
sudo nano /etc/friehub/secrets.conf
# Fill in all production env vars (DATABASE_URL, REDIS_URL, PAYSTACK keys, etc.)
sudo chmod 600 /etc/friehub/secrets.conf
```

### Deploy

```bash
# Clone to /opt/friehub
git clone https://github.com/your-org/friehub.git /opt/friehub
cd /opt/friehub

# Run the deploy script (builds, migrates, starts PM2)
bash deploy.sh
```

PM2 runs 4 processes:

| Process | Description |
|---|---|
| `friehub-web` | Next.js standalone server (port 3000) |
| `friehub-api` | Fastify API — 2 cluster instances (port 4000) |
| `friehub-workers` | BullMQ workers (order, notification, logistics, fraud) |
| `friehub-event-consumer` | Event consumer |

### Nginx

Place the provided `nginx/jumia.conf` in `/etc/nginx/sites-available/` and the shared `nginx/proxy-locations.conf` in `/etc/nginx/snippets/`:

```bash
sudo cp nginx/jumia.conf /etc/nginx/sites-available/friehub.conf
sudo cp nginx/proxy-locations.conf /etc/nginx/snippets/
sudo ln -sf /etc/nginx/sites-available/friehub.conf /etc/nginx/sites-enabled/friehub.conf
sudo nginx -t && sudo systemctl reload nginx
```

### SSL

```bash
sudo certbot --nginx -d friehub.cloud -d www.friehub.cloud
sudo certbot --nginx -d staging.friehub.cloud
```

### Make PM2 survive reboots

```bash
pm2 startup        # copy and run the printed command as root
pm2 save
```

### Subsequent deploys

```bash
# Zero-downtime reload — existing requests finish before old processes die
cd /opt/friehub
git pull
bash deploy.sh
```

Or via PM2 directly if only restarting (no code change):

```bash
pm2 reload friehub-web
pm2 reload friehub-api
```

---

## CI/CD

GitHub Actions workflows are in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Push to `main`, `develop`, PRs | TypeScript check, lint, audit, Rust check + clippy |
| `deploy-staging.yml` | Push to `staging` branch | Build + PM2 reload on staging server |
| `deploy-production.yml` | Push to `main` branch | Validate → build → migrate → PM2 reload → smoke test |

The workflows run on a **self-hosted runner** on your VPS. No Docker build step — CI runs `pnpm build` directly, which takes 2-3 minutes instead of 30.

To register your VPS as a runner: **GitHub repo → Settings → Actions → Runners → New self-hosted runner**, then follow the instructions on your server.

Required GitHub secrets:

| Secret | Description |
|---|---|
| `DB_PASSWORD` | Production database password |
| `SLACK_WEBHOOK_URL` | (Optional) Slack deploy notifications |

---

## Useful PM2 Commands

```bash
pm2 status                          # all processes
pm2 logs friehub-web --lines 50    # tail web logs
pm2 logs friehub-api --lines 50    # tail api logs
pm2 logs friehub-workers            # tail worker logs
pm2 reload friehub-web             # zero-downtime reload
pm2 reload ecosystem.config.cjs    # reload all processes
pm2 monit                          # live CPU/memory dashboard
```

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for branch naming, commit conventions, PR rules, and module architecture rules.

The short version:

- Branch from `main`: `feature/<module>/<description>`
- One msodule per branch
- `pnpm typecheck` and `pnpm lint` must pass before opening a PR
- No business logic in route handlers — they call module functions, nothing else
- Never import from another module's internal files — only from its `index.ts`

---

## License

MIT