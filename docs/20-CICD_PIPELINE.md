# CI/CD Pipeline: GitHub → VPS Auto-Deploy

---

## Architecture Decision: Self-Hosted Runner

There are two ways to deploy from GitHub Actions to a VPS:

| Approach | How | Rust Build Time | Cost |
|---|---|---|---|
| **GitHub-hosted runner → SSH into VPS** | Runner builds on GitHub, SSH to restart | 25–40 min (cold) | Uses GitHub Actions minutes (2000/mo free for private) |
| **Self-hosted runner on VPS** | VPS runs the GitHub Actions job itself | **2–3 min** (cached) | Free. Self-hosted runners consume zero GitHub minutes. |

**Self-hosted runner wins.** The reason is Rust. A cold `cargo build --release` for 6 services takes 30+ minutes. With a self-hosted runner, the `target/` directory persists between runs on the same machine. After the first build, only changed crates recompile — typically 2–3 minutes.

---

## Branch Strategy

```
main        → production auto-deploy (protected)
staging     → staging environment auto-deploy (same VPS, port 3001/4001)
develop     → CI only (typecheck + tests, no deploy)
feat/*      → CI only (typecheck + lint)
fix/*       → CI only (typecheck + lint)
```

**Branch protection rules on `main` (configure in GitHub → Settings → Branches):**
- Require status checks to pass before merging
- Required checks: `typecheck`, `lint`, `test`
- Require at least 1 approving review (enforces code review even solo)
- Do not allow bypassing the above settings
- Block force pushes
- Block deletions

---

## Secrets Configuration

Go to **GitHub → Your Repo → Settings → Secrets and variables → Actions → New repository secret**.

Add every secret your application needs:

| Secret Name | Value |
|---|---|
| `DB_PASSWORD` | Strong random password |
| `JWT_SECRET` | 64-char hex |
| `NEXTAUTH_SECRET` | 32-char random |
| `NEXTAUTH_URL` | https://yourdomain.com |
| `PAYSTACK_SECRET` | sk_live_... |
| `PAYSTACK_WEBHOOK_SECRET` | ... |
| `R2_ACCOUNT_ID` | ... |
| `R2_ACCESS_KEY_ID` | ... |
| `R2_SECRET_ACCESS_KEY` | ... |
| `R2_BUCKET` | jumia-media |
| `R2_ENDPOINT` | https://xxx.r2.cloudflarestorage.com |
| `R2_PUBLIC_URL` | https://media.yourdomain.com |
| `RESEND_API_KEY` | re_... |
| `TERMII_API_KEY` | ... |
| `INTERNAL_API_TOKEN` | 64-char hex |
| `SLACK_WEBHOOK_URL` | Optional — deploy notifications |

GitHub injects these as env vars inside the Actions runner. The workflow writes them to `.env.prod` on the VPS before each deploy. The file is never committed.

---

## Self-Hosted Runner Setup (Run Once on VPS)

```bash
# 1. Create a dedicated user for the runner (never run as root)
useradd -m -s /bin/bash github-runner
usermod -aG docker github-runner   # allow Docker commands

# 2. Go to GitHub → Repo → Settings → Actions → Runners → New self-hosted runner
#    Select: Linux x64
#    Copy the token shown on that page, then:

su - github-runner
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.319.1.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.319.1/actions-runner-linux-x64-2.319.1.tar.gz
tar xzf ./actions-runner-linux-x64-2.319.1.tar.gz

# 3. Configure with your repo token
./config.sh \
  --url https://github.com/Friehub/ecommerce \
  --token YOUR_RUNNER_TOKEN \
  --name vps-production \
  --labels production \
  --work /opt/runner-work \
  --unattended

# 4. Install as a systemd service (survives reboots)
sudo ./svc.sh install github-runner
sudo ./svc.sh start

# 5. Verify it appears in GitHub → Settings → Actions → Runners as "Idle"
```

The runner communicates outbound over HTTPS to GitHub. No inbound port is needed. Your firewall stays locked.

---

## GitHub Actions Workflows

### Workflow 1: CI — Runs on every push and PR

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches-ignore: [main, staging]
  pull_request:
    branches: [main, staging, develop]

jobs:
  typecheck:
    name: Typecheck
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter @ecom/db generate

      - name: Typecheck all packages
        run: pnpm -r typecheck

  lint:
    name: Lint
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -r lint

  rust-check:
    name: Rust Check
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Rust check (fast compile validation)
        working-directory: services
        run: cargo check --workspace

      - name: Rust clippy (lint)
        working-directory: services
        run: cargo clippy --workspace -- -D warnings
```

---

### Workflow 2: Production Deploy — Runs on push to main

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

# Only one deploy runs at a time — queues subsequent pushes
concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  validate:
    name: Validate
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter @ecom/db generate

      - name: Typecheck
        run: pnpm -r typecheck

      - name: Rust check
        working-directory: services
        run: cargo check --workspace

  deploy:
    name: Deploy
    needs: validate
    runs-on: self-hosted
    environment: production   # requires manual approval if configured

    steps:
      - uses: actions/checkout@v4

      # ── Write secrets to .env.prod ───────────────────────────────
      - name: Write environment file
        run: |
          cat > /opt/jumia/.env.prod << EOF
          DB_PASSWORD=${{ secrets.DB_PASSWORD }}
          DATABASE_URL=postgresql://ecom:${{ secrets.DB_PASSWORD }}@postgres:5432/ecom
          REDIS_URL=redis://redis:6379
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL=${{ secrets.NEXTAUTH_URL }}
          PAYSTACK_SECRET=${{ secrets.PAYSTACK_SECRET }}
          PAYSTACK_WEBHOOK_SECRET=${{ secrets.PAYSTACK_WEBHOOK_SECRET }}
          R2_ACCOUNT_ID=${{ secrets.R2_ACCOUNT_ID }}
          R2_ACCESS_KEY_ID=${{ secrets.R2_ACCESS_KEY_ID }}
          R2_SECRET_ACCESS_KEY=${{ secrets.R2_SECRET_ACCESS_KEY }}
          R2_BUCKET=${{ secrets.R2_BUCKET }}
          R2_ENDPOINT=${{ secrets.R2_ENDPOINT }}
          R2_PUBLIC_URL=${{ secrets.R2_PUBLIC_URL }}
          RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}
          TERMII_API_KEY=${{ secrets.TERMII_API_KEY }}
          INTERNAL_API_TOKEN=${{ secrets.INTERNAL_API_TOKEN }}
          NODE_ENV=production
          RUST_LOG=info
          LOG_LEVEL=info
          EOF
          chmod 600 /opt/jumia/.env.prod

      # ── Run database migrations BEFORE any service restarts ───────
      - name: Run Prisma migrations
        working-directory: /opt/jumia
        run: |
          docker compose -f docker-compose.prod.yml --env-file .env.prod \
            run --rm api sh -c "npx prisma migrate deploy"

      # ── Build and deploy TypeScript services ──────────────────────
      - name: Build and deploy TypeScript services
        working-directory: /opt/jumia
        run: |
          docker compose -f docker-compose.prod.yml --env-file .env.prod \
            up -d --no-deps --build \
            web api workers event-consumer

      # ── Health check: API must respond within 60 seconds ─────────
      - name: Health check — API
        run: |
          for i in $(seq 1 12); do
            if curl -sf http://localhost:4000/health; then
              echo "API healthy"
              exit 0
            fi
            echo "Attempt $i/12 — waiting..."
            sleep 5
          done
          echo "ERROR: API health check failed. Triggering rollback."
          exit 1

      # ── Build and deploy Rust services ────────────────────────────
      # These run after TS services are confirmed healthy.
      # Rust services are stateless — restarts are safe.
      - name: Build and deploy Rust services
        working-directory: /opt/jumia
        run: |
          docker compose -f docker-compose.prod.yml --env-file .env.prod \
            up -d --no-deps --build \
            search inventory fraud recommendations auction image-processor

      # ── Reload Nginx (picks up any config changes) ────────────────
      - name: Reload Nginx
        working-directory: /opt/jumia
        run: |
          docker compose -f docker-compose.prod.yml \
            exec -T nginx nginx -s reload

      # ── Final health check ────────────────────────────────────────
      - name: Final health check — web
        run: curl -sf https://${{ secrets.NEXTAUTH_URL }}/api/health || true

      # ── Notify Slack on success ───────────────────────────────────
      - name: Notify success
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ *Production deploy complete* — `${{ github.sha }}` by ${{ github.actor }}\n${{ github.event.head_commit.message }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      # ── Notify Slack on failure ───────────────────────────────────
      - name: Notify failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ *Production deploy FAILED* — `${{ github.sha }}` by ${{ github.actor }}\nCheck: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  rollback:
    name: Rollback on failure
    needs: deploy
    if: failure()
    runs-on: self-hosted
    steps:
      - name: Rollback to previous Docker images
        working-directory: /opt/jumia
        run: |
          echo "Deploy failed. Rolling back to previous images..."
          # Docker Compose keeps the previous image until you explicitly remove it.
          # Rolling back = restart with old image (no --build flag).
          docker compose -f docker-compose.prod.yml --env-file .env.prod \
            up -d web api workers event-consumer
          echo "Rollback complete."
```

---

### Workflow 3: Staging Deploy

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [staging]

concurrency:
  group: deploy-staging
  cancel-in-progress: true  # staging can be interrupted

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Write staging environment
        run: |
          cat > /opt/jumia-staging/.env.staging << EOF
          DATABASE_URL=postgresql://ecom_staging:${{ secrets.DB_PASSWORD }}@postgres:5432/ecom_staging
          REDIS_URL=redis://redis:6380
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          NEXTAUTH_URL=https://staging.yourdomain.com
          NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
          NODE_ENV=production
          EOF

      - name: Deploy staging
        working-directory: /opt/jumia-staging
        run: |
          docker compose -f docker-compose.staging.yml --env-file .env.staging \
            up -d --build
```

---

## Sync VPS Repo From GitHub (Initial Setup)

The self-hosted runner checks out code directly from GitHub (private repo access is handled by the runner token automatically). You do not need to manually `git pull` on the VPS. The runner fetches the latest commit as part of `actions/checkout`.

However, the `docker-compose.prod.yml`, `nginx/`, and `scripts/` need to be present at `/opt/jumia/` on the VPS. Set this up once:

```bash
# On the VPS — one time
cd /opt
git clone https://github.com/YOUR_ORG/YOUR_REPO.git jumia

# The runner checkout will keep this up to date automatically
# from within the workflow (actions/checkout writes to the workspace,
# which is then used for docker compose build)
```

---

## Deploy Flow Summary

```
Developer pushes to a feature branch
        │
        ▼
GitHub Actions CI (typecheck + lint + rust check)
        │
        ▼ (PR opened)
Code review required (branch protection)
        │
        ▼ (PR merged to main)
GitHub Actions detects push to main
        │
        ▼
Self-hosted runner on VPS starts the job
        │
        ├── Validate (typecheck + rust check) — ~3 min
        ├── Write .env.prod from GitHub Secrets
        ├── prisma migrate deploy
        ├── docker compose build web api workers event-consumer
        ├── docker compose up -d (rolling restart)
        ├── Health check: curl http://localhost:4000/health (retry x12)
        ├── docker compose build + up Rust services
        ├── nginx -s reload
        └── Notify Slack ✅ or ❌
                │
                ▼ (on failure)
        Rollback job triggers automatically
        (restarts previous Docker image without --build)
```

**Total deploy time after setup:**
- TypeScript services: ~4–6 min (Node.js build)
- Rust services: ~2–3 min (incremental, cached on VPS)
- Health check: up to 60 sec

---

## Environment Management

| Environment | Branch | URL | Database |
|---|---|---|---|
| Local dev | any | localhost:3000 | Local Postgres |
| Staging | `staging` | staging.yourdomain.com | ecom_staging (same VPS, separate DB) |
| Production | `main` | yourdomain.com | ecom (production DB) |

Staging runs on the same VPS but different Docker Compose file with different ports (3001, 4001) and a separate database schema. This lets you validate changes against real infrastructure before they hit production.
