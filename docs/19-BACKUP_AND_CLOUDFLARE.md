# Backup Strategy, Cloudflare, and AWS

---

## Layer 1 — Cloudflare (Free + Paid)

Cloudflare sits in front of your Contabo VPS. It is not a hosting provider — it is a global network that proxies your traffic and provides security, CDN, and routing.

### What You Get on the Free Plan

| Feature | Value |
|---|---|
| **DDoS mitigation** | Always on. Absorbs L3/L4 attacks before they reach your VPS |
| **CDN** | Product images, CSS, JS cached globally. First byte from Nigeria hits Lagos PoP, not Contabo |
| **SSL/TLS** | Free certificate. Cloudflare terminates SSL at edge |
| **DNS** | Fast Anycast DNS. No BIND config needed |
| **Firewall rules** | 5 rules free — block countries, rate-limit paths |
| **Bot protection** | Basic bot filtering |
| **Analytics** | Request volume, cache hit rate, bandwidth saved |

### Cloudflare Setup Steps

```
1. Create account at cloudflare.com
2. Add domain → Cloudflare scans existing DNS records
3. Update nameservers at registrar to Cloudflare's nameservers
4. In Cloudflare DNS: add A record → your Contabo IP
5. Set SSL/TLS mode: Full (Strict)
6. Enable "Always Use HTTPS"
```

### Page Rules / Cache Rules (Free)

```
# Cache static assets for 1 year
URL pattern: yourdomain.com/_next/static/*
Cache level: Cache Everything
Edge Cache TTL: 1 year

# Never cache API routes (serve fresh)
URL pattern: yourdomain.com/api/*
Cache level: Bypass

# Cache product pages for 60 seconds (flash sale safety margin)
URL pattern: yourdomain.com/product/*
Cache level: Cache Everything
Edge Cache TTL: 60 seconds
```

### Cloudflare Firewall Rules (Protect VPS)

```
# Block all traffic that does not come through Cloudflare
# On your VPS, iptables to only accept from Cloudflare IP ranges:
curl https://www.cloudflare.com/ips-v4 | while read ip; do
  iptables -A INPUT -p tcp --dport 443 -s $ip -j ACCEPT
  iptables -A INPUT -p tcp --dport 80 -s $ip -j ACCEPT
done
# Block direct access to your VPS IP (hides real IP)
iptables -A INPUT -p tcp --dport 443 -j DROP
iptables -A INPUT -p tcp --dport 80 -j DROP
# Allow SSH only from your own IP
iptables -A INPUT -p tcp --dport 22 -s YOUR_OFFICE_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP
```

Now your Contabo VPS IP is secret. Attackers cannot DDoS it directly.

### Cloudflare Paid Features Worth Considering

| Feature | Cost | Justification |
|---|---|---|
| **Argo Smart Routing** | ~$5/mo + usage | Routes traffic around congested internet paths to Contabo. Reduces latency by 10–30% |
| **Workers** | $5/mo (10M req included) | Run geo-routing logic at edge — serve Kenyan users from local origin, Nigerian from Contabo |
| **R2 Storage** | $0.015/GB/mo | Store product images. Zero egress fee (unlike AWS S3). Compatible with S3 SDK |
| **Bot Management** | $6/mo | Important for flash sales — bots buy out stock within milliseconds |

**R2 is the recommended media storage** — no egress fees, S3-compatible (your existing `@aws-sdk/client-s3` code works without changes, just update the endpoint URL).

---

## Layer 2 — Cloudflare R2 (Product Media Storage)

Product images must not live on the VPS disk. Disk I/O competes with Postgres. On a 12GB VPS, a 400GB disk fills quickly with product photos.

**R2 configuration in your existing code:**

```typescript
// packages/api/modules/media/services/media-service.ts
import { S3Client } from '@aws-sdk/client-s3'

// Change only this — everything else stays the same
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
```

**Cost comparison for 100GB of product images:**

| Provider | Storage/mo | Egress per 1TB | Total (heavy traffic) |
|---|---|---|---|
| AWS S3 | $2.30 | $90 | $92+ |
| Cloudflare R2 | $1.50 | **$0** | $1.50 |
| Backblaze B2 | $0.60 | $10 (after 3GB free) | ~$10 |

R2 wins for a CDN-heavy ecommerce site where images are served millions of times.

---

## Layer 3 — Database Backups

### Automated Daily Postgres Backup to Backblaze B2

Backblaze B2 is S3-compatible and costs $0.006/GB/month — 10x cheaper than AWS S3 for cold storage.

```bash
#!/bin/bash
# /opt/scripts/backup-postgres.sh
# Run via cron: 0 2 * * * /opt/scripts/backup-postgres.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/ecom_${DATE}.sql.gz"
B2_BUCKET="s3://your-b2-bucket/postgres-backups"

# Dump and compress
docker exec postgres pg_dump -U ecom ecom | gzip > "$BACKUP_FILE"

# Upload to Backblaze B2 (S3-compatible)
AWS_ACCESS_KEY_ID="${B2_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}" \
aws s3 cp "$BACKUP_FILE" "$B2_BUCKET/" \
  --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com"

# Delete local copy
rm "$BACKUP_FILE"

# Delete backups older than 30 days from B2
AWS_ACCESS_KEY_ID="${B2_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}" \
aws s3 ls "$B2_BUCKET/" \
  --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com" \
  | awk '{print $4}' \
  | while read key; do
      FILEDATE=$(echo "$key" | grep -oP '\d{8}')
      CUTOFF=$(date -d "30 days ago" +%Y%m%d)
      if [[ "$FILEDATE" < "$CUTOFF" ]]; then
        aws s3 rm "$B2_BUCKET/$key" \
          --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com"
      fi
    done

echo "Backup complete: $BACKUP_FILE"
```

```bash
# Install in cron
echo "0 2 * * * /opt/scripts/backup-postgres.sh >> /var/log/backup.log 2>&1" | crontab -
```

### Redis Backup

Redis already writes AOF (append-only file) snapshots continuously. Add a cron job to ship the latest RDB file to B2 daily:

```bash
#!/bin/bash
# /opt/scripts/backup-redis.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec redis redis-cli BGSAVE
sleep 5  # wait for BGSAVE to complete
docker cp redis:/data/dump.rdb "/tmp/redis_${DATE}.rdb"

AWS_ACCESS_KEY_ID="${B2_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}" \
aws s3 cp "/tmp/redis_${DATE}.rdb" "s3://your-b2-bucket/redis-backups/" \
  --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com"

rm "/tmp/redis_${DATE}.rdb"
```

### VPS Snapshot (Full Disk Backup)

Contabo's control panel allows weekly VPS snapshots. This is a full disk image — if the server dies completely, you restore the entire state in minutes. Schedule weekly snapshots on Sunday 03:00.

**Backup retention policy:**

| Backup Type | Frequency | Retention | Storage |
|---|---|---|---|
| Postgres dump | Daily 02:00 UTC | 30 days | Backblaze B2 |
| Redis RDB | Daily 02:30 UTC | 7 days | Backblaze B2 |
| Contabo VPS snapshot | Weekly Sunday 03:00 | 4 weeks (last 4) | Contabo panel |
| Search index | Weekly (copy /data/index) | 2 copies | Backblaze B2 |

---

## Layer 4 — AWS (Compliance Archive Tier)

AWS is not your primary infrastructure. Use it only for long-term compliance archiving.

**Use case:** Nigerian NDPR requires you to keep transaction records for 5 years. Backblaze B2 is fine for operational backups (30 days). AWS Glacier is the correct tool for 5-year cold archives.

**Lifecycle policy: Backblaze B2 → AWS Glacier**

Monthly, move Postgres dumps older than 30 days to AWS Glacier:

```bash
#!/bin/bash
# /opt/scripts/archive-to-glacier.sh — runs 1st of each month
# Uploads the previous month's final backup to AWS Glacier

YEAR_MONTH=$(date -d "last month" +%Y%m)
B2_FILE="s3://your-b2-bucket/postgres-backups/ecom_${YEAR_MONTH}01_*.sql.gz"
GLACIER_VAULT="ecom-compliance-archive"

# Download from B2
AWS_ACCESS_KEY_ID="${B2_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${B2_APP_KEY}" \
aws s3 cp "$B2_FILE" "/tmp/monthly_archive.sql.gz" \
  --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com"

# Upload to Glacier
aws glacier upload-archive \
  --vault-name "$GLACIER_VAULT" \
  --account-id - \
  --body "/tmp/monthly_archive.sql.gz" \
  --region eu-west-1

rm "/tmp/monthly_archive.sql.gz"
```

**AWS Glacier cost:** ~$0.004/GB/month. A 5-year archive of 200GB of compressed dumps costs ~$1/month.

---

## Multi-Region: Kenya + Nigeria

When you expand to Kenya (Liquid Cloud / Safaricom, no AWS), the backup strategy adapts:

| Region | Primary DB | Backup | Archive |
|---|---|---|---|
| Nigeria | Contabo VPS or AWS af-south-1 | Backblaze B2 EU | AWS Glacier eu-west-1 |
| Kenya | Liquid Cloud Nairobi | **Backblaze B2** (provider-agnostic, works anywhere) | Local tape/disk at Nairobi DC |

Backblaze B2 has no region restrictions for data residency compliance — you choose which B2 region to write to. Use `us-west-004` or `eu-central-003` as appropriate.

For Kenya where data must not leave the country: back up to a second server in the same Nairobi data center rather than cloud. Run a secondary Postgres in streaming replication and keep the replica as your backup.

---

## Full Data Flow Summary

```
User uploads product image
        │
        ▼
Browser → Cloudflare → VPS Nginx → API (generates presigned R2 URL)
        │
        ▼ (direct from browser, bypasses your server)
Cloudflare R2 ← Image uploaded directly
        │
        ▼ (webhook)
image-processor (Rust) → generates 3 WebP sizes → stores back in R2
        │
        ▼
Postgres stores R2 URLs in ProductMedia table
        │
        ▼ (nightly)
Postgres dump → gzip → Backblaze B2 (30 days)
        │
        ▼ (monthly)
Backblaze B2 → AWS Glacier (5-year compliance archive)
```
