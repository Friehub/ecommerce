# Developer Setup Guide

Get the full development environment running in under 30 minutes.

---

## Prerequisites

Install these before starting:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Docker | latest | https://docs.docker.com/get-docker/ |
| Git | any | system package manager |

Verify:
```bash
node --version    # v20+
pnpm --version    # 9+
rustc --version   # 1.78+
docker --version  # 24+
```

---

## Step 1: Clone and Install

```bash
git clone <repo-url> ecom-platform
cd ecom-platform
pnpm install
```

---

## Step 2: Start Infrastructure (Docker)

```bash
# Start PostgreSQL + Redis in the background
docker compose up -d

# Verify they are running
docker compose ps
```

`docker-compose.yml` in the root starts:
- PostgreSQL on port `5432` (database: `ecom_dev`, user: `ecom`, password: `ecom`)
- Redis on port `6379`

---

## Step 3: Environment Variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/web/.env.local`:

```env
# Database
DATABASE_URL="postgresql://ecom:ecom@localhost:5432/ecom_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth (NextAuth.js)
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional for local dev — can skip)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Paystack (use test keys from dashboard.paystack.com)
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"

# Cloudflare R2 (use local MinIO for dev — see below)
R2_ENDPOINT="http://localhost:9000"
R2_ACCESS_KEY="minioadmin"
R2_SECRET_KEY="minioadmin"
R2_BUCKET="ecom-media"

# Resend (email — use test mode)
RESEND_API_KEY="re_test_..."

# Internal Rust service URLs (use stubs in dev)
SEARCH_SERVICE_URL="http://localhost:3000/api/stubs/search"
AUCTION_SERVICE_URL="http://localhost:3000/api/stubs/auction"
INVENTORY_SERVICE_URL="http://localhost:3000/api/stubs/inventory"
FRAUD_SERVICE_URL="http://localhost:3000/api/stubs/fraud"
```

---

## Step 4: Database Setup

```bash
# Generate Prisma client
pnpm --filter @ecom/db prisma generate

# Run migrations
pnpm --filter @ecom/db prisma migrate dev

# Seed with demo data
pnpm --filter @ecom/db prisma db seed
```

What the seed creates:
- 5 sellers (Standard, Express, and Brand tier)
- 50 products across 8 categories with variants and stock levels
- 3 buyer accounts
- 10 completed orders with reviews
- 2 open disputes
- 3 active ad campaigns
- 5 affiliate agents

---

## Step 5: Start the Web App

```bash
pnpm --filter @ecom/web dev
```

Open `http://localhost:3000`.

---

## Step 6: (Optional) Start Local Media Storage

If you need to test image uploads locally:

```bash
docker compose --profile media up -d
```

This starts MinIO (S3-compatible) on port `9000`. Admin UI at `http://localhost:9001`
(user: `minioadmin`, password: `minioadmin`).

Create the bucket on first use:
```bash
docker exec ecom-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec ecom-minio mc mb local/ecom-media
docker exec ecom-minio mc policy set public local/ecom-media
```

---

## Step 7: (Optional) Build Rust Services

Only needed if you are assigned a Rust service. Otherwise, the TypeScript stubs handle
all Rust service calls automatically in development.

```bash
cd services
cargo build
```

Start an individual service:
```bash
cargo run -p ecom-search
cargo run -p ecom-inventory
```

---

## Test Accounts (from seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@ecom.dev | `admin123` |
| Seller | seller@ecom.dev | `seller123` |
| Buyer | buyer@ecom.dev | `buyer123` |
| Agent | agent@ecom.dev | `agent123` |
| Moderator | mod@ecom.dev | `mod123` |

---

## Common Commands

```bash
# Run all TypeScript checks
pnpm typecheck

# Run linter
pnpm lint

# Run tests
pnpm test

# Add a Prisma migration (after changing schema.prisma)
pnpm --filter @ecom/db prisma migrate dev --name <description>

# Reset database (wipes all data, re-seeds)
pnpm --filter @ecom/db prisma migrate reset

# Rust: check without building
cd services && cargo check

# Rust: run tests
cd services && cargo test
```

---

## Paystack Webhook Testing (Local)

Paystack cannot reach `localhost`. Use ngrok to expose a public URL:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy the https URL (e.g. https://abc123.ngrok.io)
# Set NEXTAUTH_URL=https://abc123.ngrok.io in .env.local
# Register the webhook URL in Paystack dashboard:
# https://abc123.ngrok.io/api/webhooks/paystack
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `prisma migrate dev` fails | Check `DATABASE_URL` is correct and Docker is running |
| `pnpm install` fails | Delete `node_modules` and `pnpm-lock.yaml`, run again |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill` |
| Redis connection refused | `docker compose up -d redis` |
| tRPC type errors after schema change | `pnpm --filter @ecom/db prisma generate` then restart TS server |
