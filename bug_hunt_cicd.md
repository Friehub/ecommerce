# Bug Hunt — CI/CD & Docker Infrastructure Audit
**Date:** 2026-05-05
**Scope:** `.github/workflows/`, `docker-compose.prod.yml`, `docker-compose.staging.yml`, `docker-compose.yml`

---

## Summary Table

| ID | Area | File | Severity | Category | Description |
|----|------|------|----------|----------|-------------|
| G01 | Deploy | `deploy-production.yml:rollback` | CRITICAL | Data Loss | Rollback cleanup runs `docker system prune -af --volumes` — destroys `postgres_data` volume and wipes the production database |
| G02 | Docker | `docker-compose.prod.yml:api` | CRITICAL | Security | `PAYSTACK_WEBHOOK_SECRET` is not set in the `api` service environment — webhook HMAC falls back to placeholder, negating the security fix |
| G03 | Docker | `docker-compose.prod.yml` | HIGH | Security | Redis has no `--requirepass` — any container on `app-net` can read/write all BullMQ jobs, rate limit keys, and cached sessions without auth |
| G04 | Docker | `docker-compose.prod.yml:web` | HIGH | Security | `web` (Next.js) container is on `db-net` — frontend has direct database access; API compromise gives full DB access |
| G05 | Deploy | `deploy-production.yml` | HIGH | Reliability | Migration runs before deploy but rollback does not revert migration — rolled-back app runs against new (potentially incompatible) schema |
| G06 | CI | `ci.yml` | HIGH | Quality | CI pipeline has no test step at all — only typecheck and lint run before merge to `main` |
| G07 | CI | `ci.yml:typescript` | MEDIUM | Reliability | `pnpm install --no-frozen-lockfile` in CI allows lockfile drift — different dependency versions can pass CI vs. what is deployed |
| G08 | Deploy | `deploy-production.yml` | MEDIUM | Reliability | Health check is TCP-only (`nc -z 127.0.0.1 4000`) — port being open does not mean the service is handling requests correctly |
| G09 | Deploy | `deploy-production.yml` | MEDIUM | Reliability | Rust services deploy AFTER TypeScript health check — version mismatch window between new TS code and old Rust services |
| G10 | Docker | `docker-compose.prod.yml:workers` | MEDIUM | Logic | `workers` service is missing `RESEND_API_KEY`, `PAYSTACK_SECRET_KEY`, and other env vars needed by the cron jobs it runs |
| G11 | Staging | `deploy-staging.yml` | MEDIUM | Security | Full `STAGING_ENV` secrets blob written to disk as a plain file with `echo "${{ secrets.STAGING_ENV }}"` |
| G12 | CI | `ci.yml` | LOW | Security | No `pnpm audit` or `cargo audit` step — known CVEs in dependencies are never caught |
| G13 | Docker | `docker-compose.prod.yml:search` | LOW | Reliability | Search service memory limit is 256MB — Tantivy index for 50K+ products can exceed this, causing repeated OOM kills |

---

## Detailed Findings

---

### G01 — Rollback Cleanup Destroys the Production Database
**File:** `.github/workflows/deploy-production.yml:rollback`
**Severity:** CRITICAL

```yaml
rollback:
  steps:
    - name: Cleanup rollback artifacts
      if: always()
      run: |
        docker builder prune -f
        docker image prune -f
        docker system prune -af --volumes  # ← --volumes flag wipes ALL named volumes
```

`docker system prune -af --volumes` removes ALL unused Docker resources including named volumes. `postgres_data` and `redis_data` are named volumes. If a deploy fails and the rollback job runs, this step destroys the entire production database and Redis persistence.

The `if: always()` condition makes this run regardless of whether the rollback step succeeded or failed — it always fires.

**Impact:** A single failed production deploy triggers an automatic total data wipe. Orders, users, payments, inventory — everything is gone.

**Fix:**
```yaml
- name: Cleanup rollback artifacts
  if: always()
  run: |
    docker builder prune -f
    docker image prune -f
    # Never prune volumes in production
    # docker system prune -af --volumes  ← REMOVE THIS LINE
```

---

### G02 — `PAYSTACK_WEBHOOK_SECRET` Missing from Production API Service
**File:** `docker-compose.prod.yml:api`
**Severity:** CRITICAL

```yaml
api:
  environment:
    DATABASE_URL: postgresql://ecom:${DB_PASSWORD}@postgres:5432/ecom
    REDIS_URL: redis://redis:6379
    JWT_SECRET: ${JWT_SECRET}
    PAYSTACK_SECRET: ${PAYSTACK_SECRET}
    INTERNAL_API_TOKEN: ${INTERNAL_API_TOKEN}
    PORT: 4000
    # ← PAYSTACK_WEBHOOK_SECRET is absent
```

`payment-service.ts` uses `process.env.PAYSTACK_WEBHOOK_SECRET` for HMAC verification. Without this variable set, the code falls back to `'whsec_test_placeholder'`. In production this means:

1. The Paystack webhook HMAC check (the fix from Phase 1) is silently disabled.
2. Any unauthenticated POST to `/api/webhooks/paystack` is accepted.
3. Orders can be confirmed for free without a real payment.

**Fix:**
```yaml
api:
  environment:
    PAYSTACK_SECRET: ${PAYSTACK_SECRET}
    PAYSTACK_WEBHOOK_SECRET: ${PAYSTACK_WEBHOOK_SECRET}  # ← Add this
```

---

### G03 — Redis Has No Authentication Password
**File:** `docker-compose.prod.yml:redis`
**Severity:** HIGH

```yaml
redis:
  command: >
    redis-server
      --maxmemory 512mb
      --maxmemory-policy noeviction
      --appendonly yes
      --save 900 1
      # ← No --requirepass
```

Redis is accessible to every container on `app-net` without authentication. In a container escape or SSRF scenario, any container that can reach `redis:6379` can:
- Read all BullMQ job payloads (which contain order data, user IDs, payment references).
- Delete or modify queued jobs (cancel orders, skip notifications).
- Read/overwrite rate limit counters to bypass rate limiting.
- Flush the entire keyspace with `FLUSHALL`.

**Fix:**
```yaml
redis:
  command: >
    redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 512mb
      ...
```
Add `REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379` to all services that connect to Redis.

---

### G04 — Next.js `web` Container Has Direct Database Access
**File:** `docker-compose.prod.yml:web`
**Severity:** HIGH

```yaml
web:
  networks: [edge-net, app-net, db-net]  # ← db-net gives direct Postgres access
  environment:
    DATABASE_URL: postgresql://ecom:${DB_PASSWORD}@postgres:5432/ecom  # ← Full DB credentials
```

The frontend Next.js container is on `db-net` (the internal-only database network) and has `DATABASE_URL` set. This means:
- Next.js server components can query Postgres directly, bypassing the API's auth middleware, business logic, and audit logging.
- A vulnerability in any Next.js route handler gives an attacker direct DB access with the same user as the API (`ecom` user).
- The `web` container is also on `edge-net` (internet-facing via Nginx) — this creates a direct path from the public internet to the database.

**Fix:** Remove `db-net` from the `web` service. The frontend should only communicate with the `api` service. If Next.js server components need data, they should call the tRPC API, not Postgres directly.

---

### G05 — Deploy Rollback Cannot Revert Database Migrations
**File:** `.github/workflows/deploy-production.yml`
**Severity:** HIGH

```yaml
# Job order:
# 1. validate
# 2. deploy:
#    a. Run database migrations  ← Runs first, one-way
#    b. Deploy TS services
#    c. Health check
#    d. Deploy Rust services     ← If this fails...
# 3. rollback:                   ← ...this restarts old TS code
#    - docker compose up -d web api workers event-consumer
```

When a deploy fails after migrations have already run:
1. Migrations are committed to Postgres (irreversible with standard `migrate deploy`).
2. Rollback restarts the old Docker images.
3. The old application code runs against the new (possibly incompatible) schema.

If a migration adds a `NOT NULL` column, the old code that doesn't send that column will throw Prisma validation errors. The rollback itself can be broken.

**Fix:**
- Write all migrations to be backward-compatible (additive only — never drop or rename columns in the same migration as code changes).
- Use a separate `migrate.yml` workflow that gates on manual approval for destructive migrations.
- Consider using a `shadow database` pattern or blue-green deployments.

---

### G06 — CI Pipeline Has No Test Step
**File:** `.github/workflows/ci.yml`
**Severity:** HIGH

```yaml
jobs:
  typescript:
    steps:
      - name: Typecheck
        run: pnpm typecheck
      - name: Lint
        run: pnpm lint
      # ← No: pnpm test
      # ← No: pnpm test:integration
      # ← No: pnpm test:e2e

  rust:
    steps:
      - name: Cargo Check
        run: cargo check ...
      - name: Cargo Clippy
        run: cargo clippy ...
      # ← No: cargo test
```

The CI pipeline performs static analysis only. Zero tests are run before code merges to `main` or `develop`. Every bug documented in this audit series could have been caught with a basic test suite. The CI gives a false sense of safety — a green CI check means the code compiles and passes linting, nothing more.

**Fix:**
```yaml
- name: Run tests
  run: pnpm test --run  # Vitest

- name: Cargo test
  run: cargo test --manifest-path services/Cargo.toml
  working-directory: services
```

---

### G07 — CI Uses `--no-frozen-lockfile` (Lockfile Drift)
**File:** `.github/workflows/ci.yml`
**Severity:** MEDIUM

```yaml
- name: Install dependencies
  run: pnpm install --no-frozen-lockfile  # ← Allows version drift
```

The production deploy uses `--frozen-lockfile` (correct). CI uses `--no-frozen-lockfile`, which silently upgrades packages if the lockfile is out of date. This means:
- A developer who forgets to commit their updated `pnpm-lock.yaml` will still pass CI.
- CI runs with different package versions than production.
- Bugs introduced by dependency updates are masked in CI and only surface in production.

**Fix:** Use `--frozen-lockfile` consistently in CI.

---

### G08 — Production Health Check Is TCP-Level Only
**File:** `.github/workflows/deploy-production.yml`
**Severity:** MEDIUM

```yaml
- name: Health check — API server
  run: |
    for i in $(seq 1 12); do
      if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
        echo "API is healthy"
        exit 0
      fi
      sleep 5
    done
```

This actually calls the `/health` endpoint via `curl` — which is good. However, the Docker Compose healthcheck uses:
```yaml
healthcheck:
  test: ["CMD-SHELL", "nc -z 127.0.0.1 4000 || exit 1"]
```
`nc -z` only checks TCP connectivity. A service that starts and immediately begins returning HTTP 500 on every request passes this check. Nginx considers the container `healthy` and starts routing traffic to it.

**Fix for Docker Compose:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -sf http://localhost:4000/health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

---

### G09 — TypeScript and Rust Services Deploy in Separate Steps (Version Mismatch Window)
**File:** `.github/workflows/deploy-production.yml`
**Severity:** MEDIUM

```yaml
- name: Deploy TypeScript services
  run: docker compose up -d --build web api workers event-consumer

- name: Health check — API server
  # ... waits for API to be healthy

- name: Deploy Rust services
  run: docker compose up -d --build search inventory fraud recommendations
```

During the `Health check` and `Deploy Rust services` steps, the new TypeScript API is serving live traffic while the old Rust service images are still running. If the new API changes the request contract to any Rust service (e.g., adds a required field to the fraud check payload, or changes the search query format), requests to those services will fail during this window.

**Fix:** Build all images in parallel first, then cut over all services atomically:
```yaml
- name: Build all images
  run: docker compose build web api workers event-consumer search inventory fraud

- name: Deploy all services atomically
  run: docker compose up -d --no-build web api workers event-consumer search inventory fraud
```

---

### G10 — `workers` Service Missing Critical Environment Variables
**File:** `docker-compose.prod.yml:workers`
**Severity:** MEDIUM

```yaml
workers:
  environment:
    DATABASE_URL: postgresql://ecom:${DB_PASSWORD}@postgres:5432/ecom
    REDIS_URL: redis://redis:6379
    # Missing:
    # RESEND_API_KEY — notification emails will fail silently
    # PAYSTACK_SECRET_KEY — affiliate payout calls fail
    # NEXTAUTH_URL — used for callback URLs in some cron jobs
    # RUST_SERVICE_URLS — workers call Rust services
```

The `workers` container runs `run-workers.ts` which includes:
- `notificationService` → needs `RESEND_API_KEY`
- `ledgerService.releaseMatureEscrow` → needs full DB access (has it)
- `affiliateService.confirmMatureCommissions` → calls `paymentService.fundWallet` (DB only, OK)
- Nightly search sync → calls `catalogService.syncToSearch` → calls `RustClient` → needs `SEARCH_SERVICE_URL`

Without `RESEND_API_KEY`, all order confirmation, shipping, and delivery emails fail silently in production.

**Fix:** Pass all required env vars to the `workers` service.

---

### G11 — Staging Secrets Written to Disk as Plain Text
**File:** `.github/workflows/deploy-staging.yml`
**Severity:** MEDIUM

```yaml
- name: Write staging .env
  run: |
    echo "${{ secrets.STAGING_ENV }}" > /opt/runner-work/jumia-staging/.env.staging
    chmod 600 /opt/runner-work/jumia-staging/.env.staging
```

The entire `STAGING_ENV` secret (which contains DB passwords, API keys, JWT secrets) is written to a file on the self-hosted runner's filesystem. Even with `chmod 600`, the file persists on disk after the workflow completes. Any subsequent process running as the same user, or a future compromised workflow step, can read all staging secrets.

**Fix:** Use Docker secrets or pass env vars directly rather than writing to disk, or ensure the file is deleted at the end of the workflow:
```yaml
- name: Cleanup secrets
  if: always()
  run: rm -f /opt/runner-work/jumia-staging/.env.staging
```

---

## Docker Compose Architecture Issues

| Issue | Location | Description |
|-------|----------|-------------|
| `web` on `db-net` | `docker-compose.prod.yml` | Frontend has direct Postgres access — violates separation of concerns |
| Redis no password | Both prod and staging | All app-net containers can freely read/write Redis |
| `workers` missing env vars | `docker-compose.prod.yml` | Email notifications fail silently in production |
| `search` memory limit 256MB | `docker-compose.prod.yml` | Tantivy index can exceed this at scale, causing OOM kills |
| Staging `sleep 10` for DB ready | `deploy-staging.yml` | Brittle — slow environments will fail migration; should use polling |
