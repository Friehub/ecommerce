#!/bin/bash
# deploy.sh — zero-downtime production deployment
# Run on server via: ssh user@vps 'bash /opt/jumia/deploy.sh'
# Or trigger from GitHub Actions after SSH key is configured.

set -euo pipefail

REPO_DIR="/opt/jumia"
ENV_FILE="$REPO_DIR/.env.prod"
COMPOSE="docker compose -f $REPO_DIR/docker-compose.prod.yml --env-file $ENV_FILE"
LOG="$REPO_DIR/logs/deploy.log"

mkdir -p "$REPO_DIR/logs"
echo "──────────────────────────────────────────────" | tee -a "$LOG"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting deployment" | tee -a "$LOG"

# ── Pull latest code ───────────────────────────────────────────────
cd "$REPO_DIR"
git pull origin main | tee -a "$LOG"

# ── Run database migrations BEFORE restarting services ────────────
echo "Running Prisma migrations..." | tee -a "$LOG"
$COMPOSE run --rm api sh -c "npx prisma migrate deploy" 2>&1 | tee -a "$LOG"

# ── Build and restart TypeScript services (rolling) ───────────────
echo "Deploying TypeScript services..." | tee -a "$LOG"
$COMPOSE up -d --no-deps --build \
  web api workers event-consumer 2>&1 | tee -a "$LOG"

# Wait for API health check to pass
echo "Waiting for API health check..." | tee -a "$LOG"
for i in $(seq 1 12); do
  if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
    echo "API is healthy." | tee -a "$LOG"
    break
  fi
  if [ "$i" -eq 12 ]; then
    echo "ERROR: API health check failed after 60s. Rolling back." | tee -a "$LOG"
    $COMPOSE up -d --no-deps web api workers event-consumer
    exit 1
  fi
  sleep 5
done

# ── Rebuild Rust services only if binary changed ───────────────────
echo "Deploying Rust services..." | tee -a "$LOG"
$COMPOSE up -d --no-deps --build \
  search inventory fraud recommendations auction image-processor 2>&1 | tee -a "$LOG"

# ── Reload Nginx (picks up any config changes) ─────────────────────
echo "Reloading Nginx..." | tee -a "$LOG"
$COMPOSE exec nginx nginx -s reload 2>&1 | tee -a "$LOG"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Deployment complete" | tee -a "$LOG"

# ── Show running containers ────────────────────────────────────────
$COMPOSE ps | tee -a "$LOG"
