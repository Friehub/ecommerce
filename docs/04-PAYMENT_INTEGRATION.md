# 04 - Payment Integration (Paystack)

**Status:** Research
**Blocks:** Payment module, checkout flow, wallet funding, refunds.

---

## Why Paystack

- Nigerian standard. Supports card, bank transfer, USSD, and mobile money.
- Handles PCI compliance on their end — we never touch raw card data.
- Webhooks for async payment confirmation (critical for the escrow model).

---

## Payment Flow

### Card / Bank Transfer

```
1. User confirms order
2. orders.create is called → order created (status=PENDING_PAYMENT)
3. payments.initiate called → POST /transaction/initialize to Paystack
   → Returns { reference, authorization_url }
4. User is redirected to Paystack hosted page (web) or Paystack SDK (mobile)
5. User completes payment on Paystack
6. Paystack sends webhook → POST /api/webhooks/paystack
7. We verify the webhook signature (HMAC-SHA512)
8. If event = charge.success → fire payment.confirmed event
9. orders module listener → transitions order to PROCESSING
```

### Pay on Delivery (POD)

```
1. User selects POD at checkout
2. Order created with payment_method=POD, status=PROCESSING (no payment needed upfront)
3. On delivery → delivery agent marks shipment.delivered
4. payment.confirmed event fired (amount = order total, method = POD)
5. Seller finance ledger entry created
```

### JumiaPay Wallet

```
1. User funds wallet via Paystack (card/bank transfer)
2. On payment.confirmed → wallet.balance += amount
3. At checkout with wallet → deduct from wallet atomically
4. If wallet balance < order total → show top-up prompt or split payment option
```

---

## Paystack APIs We Use

| API | Endpoint | When |
|---|---|---|
| Initialize Transaction | `POST /transaction/initialize` | Start checkout |
| Verify Transaction | `GET /transaction/verify/:ref` | Backup verification |
| Refund | `POST /refund` | Return approved or dispute ruled for buyer |
| List Banks | `GET /bank` | Seller bank account setup |
| Create Transfer Recipient | `POST /transferrecipient` | Seller payout setup |
| Initiate Transfer | `POST /transfer` | Weekly seller settlement payout |

---

## Webhook Events We Handle

| Event | Action |
|---|---|
| `charge.success` | Fire `payment.confirmed` |
| `transfer.success` | Mark seller payout as COMPLETED |
| `transfer.failed` | Alert finance team, retry |
| `refund.processed` | Update refund status, notify buyer |

---

## Webhook Security

- Paystack signs every webhook with HMAC-SHA512 using our secret key.
- We verify the `x-paystack-signature` header before processing any webhook.
- Webhook endpoint is rate-limited and IP-restricted to Paystack's known IP ranges.

---

## Refund Logic

```
Return QC passes
  → refund.initiate called
  → POST /refund to Paystack with original transaction reference
  → Paystack processes refund to original payment method
  → Webhook refund.processed received → update Refund record → notify buyer

If original method = Wallet → directly credit wallet (no Paystack call needed)
```

---

## Seller Payout (Settlement)

```
Every Monday (cron job):
  1. SellerStatement generated for previous week
  2. Net = gross_sales - commission - ad_spend - penalties
  3. POST /transfer to Paystack (using seller's saved Transfer Recipient ID)
  4. Payout record created (status=PENDING)
  5. On transfer.success webhook → Payout status=COMPLETED
```

---

## Environment Variables Required

```
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=whsec_...
```
