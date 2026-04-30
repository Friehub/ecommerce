# External Integrations: Warehouse & Seller Product Uploads

---

## The Problem

Warehouses and distributors do not use web forms. They operate with:
- **ERPs** (SAP, Odoo, QuickBooks) that export flat files
- **CSV/Excel spreadsheets** with thousands of rows
- **SFTP drops** — traditional supply chain standard
- **Barcode scanners** that generate EDI (Electronic Data Interchange) documents

A seller with 10,000 SKUs cannot upload them one by one through a web form. The platform must accept bulk data in the formats suppliers already use.

---

## Integration Channels

### 1. Bulk CSV/Excel Upload (Primary for sellers)

**Flow:**

```
Seller uploads CSV  →  API validates header row  →  BullMQ job created
        →  Worker processes rows in batches of 100
        →  Creates ProductVariants + StockLevels
        →  Pushes to Rust search index
        →  Returns job progress URL
```

**API endpoints to build:**

```
POST /api/products/bulk-import
  Content-Type: multipart/form-data
  Body: file (CSV or XLSX), warehouseId

Response:
  { jobId: "job_xxx", statusUrl: "/api/products/bulk-import/job_xxx" }

GET /api/products/bulk-import/:jobId
Response:
  {
    status: "PROCESSING",
    total: 5000,
    processed: 1200,
    failed: 3,
    errors: [{ row: 45, message: "Invalid EAN barcode" }]
  }
```

**CSV format spec (give this to warehouses):**

```csv
ean,title,brand,category_slug,price,stock_quantity,warehouse_id,weight_kg,images
6001234567890,Samsung Galaxy A15,Samsung,smartphones,89999,50,WH-001,0.193,https://cdn.../img1.jpg
```

**Implementation — the BullMQ job:**

```typescript
// packages/api/modules/catalog/workers/bulk-import-worker.ts
import { Worker, Job } from 'bullmq'
import { parse } from 'csv-parse/sync'
import { prisma } from '@ecom/db'
import { catalogService } from '../services/catalog-service'

export const bulkImportWorker = new Worker('bulk-import', async (job: Job) => {
  const { fileBuffer, sellerId, warehouseId } = job.data
  const rows = parse(fileBuffer, { columns: true, skip_empty_lines: true })

  const BATCH_SIZE = 100
  let processed = 0
  const errors: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    await Promise.allSettled(batch.map(async (row: any, idx: number) => {
      try {
        await catalogService.upsertVariantFromImport({
          ean: row.ean,
          title: row.title,
          brand: row.brand,
          categorySlug: row.category_slug,
          price: parseFloat(row.price),
          quantity: parseInt(row.stock_quantity),
          warehouseId,
          sellerId,
          images: row.images?.split('|') ?? [],
        })
        processed++
      } catch (err: any) {
        errors.push({ row: i + idx + 2, message: err.message })
      }
    }))

    // Update job progress
    await job.updateProgress(Math.round((i / rows.length) * 100))
  }

  return { processed, failed: errors.length, errors }
}, { connection: redis })
```

---

### 2. REST API for ERP/WMS Systems (Warehouse Management Systems)

External systems like Odoo or custom WMS use this to push inventory updates programmatically.

**Authentication:** API keys per seller/warehouse (not user session tokens).

```typescript
// New schema needed in iam.prisma:
model ApiKey {
  id         String   @id @default(cuid())
  key        String   @unique  // hashed bcrypt
  name       String
  sellerId   String
  scopes     String[] // ["products:write", "inventory:write", "orders:read"]
  lastUsedAt DateTime?
  createdAt  DateTime @default(now())
  seller     Seller   @relation(fields: [sellerId], references: [id])
}
```

**Endpoints:**

```
# Create/update a product variant
PUT /api/v1/products/:ean
Authorization: Bearer ak_live_xxxxx
Content-Type: application/json

{
  "title": "Samsung Galaxy A15 128GB Black",
  "price": 89999,
  "stock": 50,
  "warehouseId": "WH-001"
}

# Adjust stock (warehouse scanner trigger)
POST /api/v1/inventory/adjust
Authorization: Bearer ak_live_xxxxx

{
  "ean": "6001234567890",
  "warehouseId": "WH-001",
  "adjustment": -5,   // negative = stock out, positive = stock in
  "reason": "DAMAGED"
}

# Acknowledge an order (WMS confirms it can fulfill)
PATCH /api/v1/orders/:packageId/acknowledge
Authorization: Bearer ak_live_xxxxx

# Mark as shipped (WMS triggers this when courier picks up)
PATCH /api/v1/orders/:packageId/ship
{
  "trackingNumber": "GIG-12345",
  "courierId": "gig-logistics"
}
```

---

### 3. SFTP Drop (Traditional Supply Chains)

Large distributors and FMCG brands (Unilever, Nestlé) use SFTP to drop daily inventory files. Set up an SFTP server on the VPS that watches for new files and processes them.

```bash
# Install ProFTPD or use sftp-server
apt install openssh-server

# Create dedicated SFTP user per warehouse partner
useradd -m -d /sftp/wh-unilever wh-unilever
passwd wh-unilever

# Watch for new files and process them
# /etc/cron.d/sftp-processor
*/5 * * * * /opt/scripts/process-sftp-drops.sh
```

```bash
#!/bin/bash
# process-sftp-drops.sh
SFTP_DIR="/sftp"

for dir in "$SFTP_DIR"/*/; do
  for file in "$dir"*.csv; do
    [ -f "$file" ] || continue
    SELLER_ID=$(basename "$dir")
    
    # POST file to bulk import API
    curl -s -X POST "http://localhost:4000/api/products/bulk-import" \
      -H "X-Internal-Token: ${INTERNAL_API_TOKEN}" \
      -F "file=@${file}" \
      -F "sellerId=${SELLER_ID}"
    
    # Move to processed folder
    mv "$file" "${dir}processed/$(date +%Y%m%d_%H%M%S)_$(basename "$file")"
    
    echo "Processed: $file"
  done
done
```

---

### 4. Webhook Receiver (Real-time ERP push)

When an order is placed, the ERP needs to be notified to pick and pack it. When the ERP marks it as shipped, the platform updates order status.

```
Jumia Platform                     External WMS/ERP
      │                                  │
      │  POST /webhook/order-created  →  │  (when order is PAID)
      │                                  │  ERP creates pick list
      │                                  │
      │  ← POST /api/v1/orders/ship   │  (when ERP ships it)
      │                                  │
      │  Order status: SHIPPED           │
```

**Outbound webhooks (platform → ERP):**

```typescript
// In order-service.ts, after payment confirmed:
async function notifyWarehouseWebhook(order: Order) {
  const seller = await prisma.seller.findUnique({
    where: { id: order.packages[0].sellerId },
    select: { webhookUrl: true, webhookSecret: true }
  })

  if (!seller?.webhookUrl) return

  const payload = JSON.stringify({ event: 'order.created', order })
  const sig = crypto
    .createHmac('sha256', seller.webhookSecret ?? '')
    .update(payload)
    .digest('hex')

  await fetch(seller.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': sig
    },
    body: payload
  })
}
```

---

### 5. Image Upload Pipeline (Sellers submitting product photos)

Sellers upload product images. The image-processor Rust service handles compression and WebP conversion.

**Flow:**

```
Seller requests presigned URL  →  API calls R2 to generate URL
        →  Seller uploads directly to R2 (bypasses your server)
        →  R2 triggers webhook to image-processor
        →  image-processor downloads original, generates WebP at 3 sizes
        →  Stores optimised images back in R2
        →  Updates ProductMedia record in Postgres
```

**Why presigned URLs:** The image never passes through your server. A 10MB RAW photo goes directly from the seller's browser to Cloudflare R2. Your VPS bandwidth is not consumed.

```typescript
// media-service.ts (wire this to a router)
async getPresignedUploadUrl(sellerId: string, filename: string) {
  const key = `products/${sellerId}/${Date.now()}-${filename}`
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    ContentType: 'image/*',
  })
  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  return { uploadUrl: url, key }
}
```

---

## Seller Onboarding for Bulk Upload

The seller dashboard needs a bulk upload UI. Sellers drag-drop a CSV, see a column mapping step, see live progress via polling.

```
/seller/products/import
    ↓
Step 1: Upload CSV
Step 2: Map columns (if headers don't match spec)
Step 3: Validation preview (first 5 rows)
Step 4: Confirm → start job
Step 5: Progress bar (polling /api/products/bulk-import/:jobId)
Step 6: Summary (X imported, Y failed, download error report)
```

---

## New Schema Fields Needed

```prisma
// iam.prisma — add to Seller model
model Seller {
  // existing fields...
  webhookUrl    String?
  webhookSecret String?
  apiKeys       ApiKey[]
}

model ApiKey {
  id         String    @id @default(cuid())
  key        String    @unique
  name       String
  sellerId   String
  scopes     String[]
  lastUsedAt DateTime?
  createdAt  DateTime  @default(now())
  seller     Seller    @relation(fields: [sellerId], references: [id])
}

// catalog.prisma — add EAN to ProductVariant
model ProductVariant {
  // existing fields...
  ean String? @unique // barcode for warehouse scanning
}
```
