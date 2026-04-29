# 02 - Event Schema

**Status:** Research
**Blocks:** All cross-module interactions.

---

## How Events Work

- A module fires an event after completing a state change.
- The event bus delivers it to all registered listeners.
- Listeners are async — they never block the originating operation.
- Events are persisted to an `EventLog` table before delivery (guaranteed at-least-once).

```
Module A completes action
  → Writes event to EventLog (status=PENDING)
  → BullMQ picks it up
  → Delivers to all listeners
  → Marks EventLog status=DELIVERED
```

---

## Event Naming Convention

```
{domain}.{entity}.{past_tense_verb}

Examples:
  order.created
  payment.confirmed
  shipment.status_updated
  dispute.opened
```

---

## Full Event Registry

### IAM Events

| Event | Payload | Listeners |
|---|---|---|
| `user.registered` | `{ userId, email, role }` | notifications (welcome email) |
| `seller.approved` | `{ sellerId, userId }` | notifications, seller-hub |

---

### Order Events

| Event | Payload | Listeners |
|---|---|---|
| `order.created` | `{ orderId, userId, lineItems[], totalAmount }` | inventory (reserve stock), notifications |
| `order.cancelled` | `{ orderId, reason }` | inventory (release stock), payments (refund), seller-finance, notifications |
| `order.completed` | `{ orderId }` | seller-finance (release escrow), affiliate (confirm commissions) |

---

### Payment Events

| Event | Payload | Listeners |
|---|---|---|
| `payment.confirmed` | `{ paymentId, orderId, amount, method }` | orders (→ PROCESSING), seller-finance (ledger entry), notifications |
| `payment.failed` | `{ paymentId, orderId, reason }` | orders (→ CANCELLED), inventory (release), notifications |
| `refund.processed` | `{ refundId, orderId, amount }` | wallet (credit if wallet method), notifications |

---

### Inventory Events

| Event | Payload | Listeners |
|---|---|---|
| `stock.low` | `{ variantId, sellerId, qty }` | notifications (alert seller) |
| `stock.reserved` | `{ reservationId, variantId, orderId }` | orders |
| `stock.released` | `{ reservationId, variantId }` | orders |

---

### Shipment Events

| Event | Payload | Listeners |
|---|---|---|
| `shipment.created` | `{ shipmentId, packageId, agentId }` | orders (→ SHIPPED), notifications |
| `shipment.out_for_delivery` | `{ shipmentId, packageId }` | notifications |
| `shipment.delivered` | `{ shipmentId, packageId, proofUrl }` | orders (→ DELIVERED), seller-finance (start escrow timer), notifications |
| `shipment.failed` | `{ shipmentId, packageId, reason }` | logistics (schedule re-attempt), notifications |
| `return.received` | `{ returnId, orderLineId, qcResult }` | orders (→ RETURNED), payments (trigger refund if PASS), notifications |

---

### Advertising Events

| Event | Payload | Listeners |
|---|---|---|
| `ad.impression` | `{ campaignId, productId, userId, query }` | analytics |
| `ad.click` | `{ impressionId, userId }` | analytics, seller-finance (debit ad spend) |
| `ad.conversion` | `{ clickId, orderLineId, revenue }` | analytics, seller-finance |
| `campaign.budget_exhausted` | `{ campaignId, sellerId }` | notifications (alert seller) |

---

### Dispute Events

| Event | Payload | Listeners |
|---|---|---|
| `dispute.opened` | `{ disputeId, orderId, buyerId, sellerId }` | notifications (both parties), payments (hold refund) |
| `dispute.resolved` | `{ disputeId, ruling, refundAmount }` | payments (release/refund), orders, notifications |
| `dispute.escalated` | `{ disputeId, moderatorId }` | notifications |

---

### Affiliate Events

| Event | Payload | Listeners |
|---|---|---|
| `referral.clicked` | `{ linkId, sessionId }` | affiliate (record attribution) |
| `commission.earned` | `{ agentId, orderId, amount }` | notifications |
| `commission.paid` | `{ agentId, payoutId, amount }` | notifications |

---

## EventLog Table

All events are written here before delivery.

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| event_type | string | e.g. `order.created` |
| payload | jsonb | Full event payload |
| status | enum | PENDING / DELIVERED / FAILED |
| created_at | timestamp | |
| delivered_at | timestamp | nullable |
| retry_count | int | default 0 |

---

## Delivery Guarantees

- **At-least-once delivery** via BullMQ with retry backoff.
- **Idempotency**: Every listener checks if it has already processed an event ID before acting.
- **Dead letter queue**: Events that fail after 5 retries go to a DLQ for manual inspection.
