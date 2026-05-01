# Production Deployment: 12GB Contabo VPS

---

## Hardware Reality Check

**Contabo VPS L (recommended minimum for this stack)**
- 12 GB RAM
- 6 vCPU cores
- 400 GB NVMe SSD
- 32 TB traffic/month
- ~€14.99/month

**Memory Budget**

| Process | RAM |
|---|---|
| Nginx | 20 MB |
| Next.js standalone | 150 MB |
| Axum API server | 50 MB |
| Rust search (Tantivy) | 150 MB |
| Rust inventory | 35 MB |
| Rust fraud | 35 MB |
| Rust recommendations | 35 MB |
| Rust auction | 30 MB |
| Rust image-processor | 50 MB |
| Event consumer (Node) | 80 MB |
| Cron workers (Node) | 80 MB |
| Postgres | 512 MB |
| Redis | 256 MB |
| OS + kernel | 512 MB |
| **Total used** | **~2.0 GB** |
| **Available headroom** | **~10 GB** |

You are comfortably within budget. Postgres gets the majority of headroom via `shared_buffers`.

---

## Network Topology on a Single VPS

```
Internet
    │
    ▼
Nginx :443 (SSL termination + reverse proxy + static file server)
    │
    ├── /              →  Next.js :3000  (SSR renderer)
    ├── /api/          →  Axum API :4000 (all business logic)
    └── /_next/static/ →  Nginx serves directly (no Node.js involved)

Internal Docker network only (never exposed to internet):
    ├── search        :3001
    ├── inventory     :3002
    ├── auction       :3003
    ├── fraud         :3004
    ├── recommendations :3005
    ├── image-processor :3006
    ├── Postgres      :5432
    └── Redis         :6379
```

Firewall rule: open only ports 80, 443, 22.

---

## Docker Compose: Full Production Stack

```yaml
# docker-compose.prod.yml
version: '3.9'

networks:
  internal:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  search_index:

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: ecom
      POSTGRES_USER: ecom
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks: [internal]
    command: >
      postgres
        -c shared_buffers=2GB
        -c effective_cache_size=6GB
        -c work_mem=64MB
        -c max_connections=100
        -c checkpoint_completion_target=0.9

  redis:
    image: redis:7-alpine
    restart: always
    command: >
      redis-server
        --maxmemory 512mb
        --maxmemory-policy allkeys-lru
        --appendonly yes
        --save 900 1
    volumes:
      - redis_data:/data
    networks: [internal]

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./apps/web/.next/static:/var/www/static:ro
    networks: [internal]
    depends_on: [web, api]

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      NODE_ENV: production
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    networks: [internal]
    deploy:
      resources:
        limits:
          memory: 256M

  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      DATABASE_URL: postgresql://ecom:${DB_PASSWORD}@postgres:5432/ecom
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PAYSTACK_SECRET: ${PAYSTACK_SECRET}
    networks: [internal]
    depends_on: [postgres, redis]
    deploy:
      resources:
        limits:
          memory: 128M

  search:
    build:
      context: ./services
      dockerfile: search/Dockerfile
    restart: always
    volumes:
      - search_index:/data/index
    networks: [internal]
    deploy:
      resources:
        limits:
          memory: 256M

  inventory:
    build:
      context: ./services
      dockerfile: inventory/Dockerfile
    restart: always
    environment:
      REDIS_URL: redis://redis:6379
    networks: [internal]
    deploy:
      resources:
        limits:
          memory: 64M

  fraud:
    build:
      context: ./services
      dockerfile: fraud/Dockerfile
    restart: always
    networks: [internal]
    deploy:
      resources:
        limits:
          memory: 64M

  recommendations:
    build:
      context: ./services
      dockerfile: recommendations/Dockerfile
    restart: always
    networks: [internal]
    deploy:
      resources:
        limits:
          memory: 64M

  image-processor:
    build:
      context: ./services
      dockerfile: image-processor/Dockerfile
    restart: always
    networks: [internal]
    deploy:
      resources:
        limits:
          memory: 128M

  workers:
    build:
      context: ./packages/api
      dockerfile: Dockerfile.workers
    restart: always
    environment:
      DATABASE_URL: postgresql://ecom:${DB_PASSWORD}@postgres:5432/ecom
      REDIS_URL: redis://redis:6379
    networks: [internal]
    depends_on: [postgres, redis]
    deploy:
      resources:
        limits:
          memory: 128M

  event-consumer:
    build:
      context: ./services/event-consumer
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql://ecom:${DB_PASSWORD}@postgres:5432/ecom
      REDIS_URL: redis://redis:6379
    networks: [internal]
    depends_on: [postgres, redis]
    deploy:
      resources:
        limits:
          memory: 128M
```

---

## Nginx Configuration

```nginx
# nginx/nginx.conf
events { worker_processes auto; }

http {
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    upstream web_upstream  { server web:3000; keepalive 32; }
    upstream api_upstream  { server api:4000; keepalive 64; }

    server {
        listen 80;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        ssl_certificate     /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;

        # Static assets — Nginx serves them directly, no Node.js
        location /_next/static/ {
            root /var/www;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://api_upstream;
        }

        location /api/ {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://api_upstream;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://web_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
    }
}
```

---

## Clustering

**Rust services:** No action needed. Tokio uses all 6 vCPU cores natively via work-stealing. One process = full CPU saturation.

**Next.js:** Scale to 2 containers if you need redundancy:

```bash
docker compose -f docker-compose.prod.yml up -d --scale web=2
```

Nginx automatically load-balances between them (round-robin). Memory cost: 2 x 150MB = 300MB total.

---

## Zero-Downtime Deployment Script

```bash
#!/bin/bash
# deploy.sh
set -e

git pull origin main

# Run migrations before restarting anything
docker compose -f docker-compose.prod.yml run --rm api \
  sh -c "npx prisma migrate deploy"

# Rolling restart — old container handles traffic until new one is healthy
docker compose -f docker-compose.prod.yml up -d --no-deps --build \
  web api workers event-consumer

docker compose -f docker-compose.prod.yml up -d --no-deps --build \
  search inventory fraud recommendations auction image-processor

echo "Deployment complete"
```

---

## SSL via Let's Encrypt

```bash
apt install certbot nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
echo "0 3 * * * certbot renew --quiet && docker compose restart nginx" | crontab -
```

---

## Required Environment Variables

```bash
# .env.prod  — never commit this
DB_PASSWORD=<strong_64char_random>
JWT_SECRET=<64char_hex>
NEXTAUTH_SECRET=<32char_random>
NEXTAUTH_URL=https://yourdomain.com
PAYSTACK_SECRET=sk_live_...
PAYSTACK_WEBHOOK_SECRET=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=jumia-media
RESEND_API_KEY=re_...
TERMII_API_KEY=...
```
