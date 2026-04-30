#!/bin/bash
# backup-postgres.sh — daily Postgres backup to Backblaze B2
# Cron: 0 2 * * * /opt/jumia/scripts/backup-postgres.sh >> /var/log/jumia-backup.log 2>&1

set -euo pipefail

source /opt/jumia/.env.prod

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/ecom_${DATE}.sql.gz"
RETAIN_DAYS=30

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting Postgres backup..."

# Dump and compress in one pipe (no large temp uncompressed file)
docker exec postgres pg_dump -U ecom ecom | gzip > "$BACKUP_FILE"

FILESIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "Compressed backup size: $FILESIZE"

# Upload to Backblaze B2
AWS_ACCESS_KEY_ID="$B2_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$B2_APP_KEY" \
aws s3 cp "$BACKUP_FILE" "s3://$B2_BUCKET/postgres/" \
  --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com"

echo "Uploaded to B2: postgres/$(basename "$BACKUP_FILE")"
rm "$BACKUP_FILE"

# Prune backups older than RETAIN_DAYS
CUTOFF=$(date -d "${RETAIN_DAYS} days ago" +%Y%m%d)
AWS_ACCESS_KEY_ID="$B2_KEY_ID" \
AWS_SECRET_ACCESS_KEY="$B2_APP_KEY" \
aws s3 ls "s3://$B2_BUCKET/postgres/" \
  --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com" \
  | awk '{print $4}' \
  | while read -r key; do
      FILEDATE=$(echo "$key" | grep -oP '\d{8}' | head -1)
      if [[ -n "$FILEDATE" && "$FILEDATE" < "$CUTOFF" ]]; then
        AWS_ACCESS_KEY_ID="$B2_KEY_ID" \
        AWS_SECRET_ACCESS_KEY="$B2_APP_KEY" \
        aws s3 rm "s3://$B2_BUCKET/postgres/$key" \
          --endpoint-url "https://s3.${B2_REGION}.backblazeb2.com"
        echo "Pruned old backup: $key"
      fi
    done

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Postgres backup complete."
