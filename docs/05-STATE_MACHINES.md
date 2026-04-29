# 05 - State Machines

**Status:** Research
**Blocks:** OMS, Returns, Dispute Resolution modules.

---

## 1. Order State Machine

### States

| State | Description |
|---|---|
| `PENDING_PAYMENT` | Order created, awaiting payment |
| `PAID` | Payment confirmed, not yet processed by seller |
| `PROCESSING` | Seller confirmed, preparing shipment |
| `SHIPPED` | Package handed to delivery agent |
| `OUT_FOR_DELIVERY` | Agent on route to buyer |
| `DELIVERED` | Buyer received the package |
| `COMPLETED` | Return window expired, funds released to seller |
| `CANCELLED` | Order cancelled before shipment |
| `RETURN_REQUESTED` | Buyer initiated a return |
| `RETURNED` | Return received and QC passed |

### Transitions

| From | To | Trigger | Who |
|---|---|---|---|
| `PENDING_PAYMENT` | `PAID` | `payment.confirmed` event | System |
| `PENDING_PAYMENT` | `CANCELLED` | Payment timeout (24h) or buyer cancels | System / Buyer |
| `PAID` | `PROCESSING` | Seller confirms order | Seller |
| `PAID` | `CANCELLED` | Seller rejects or buyer cancels | Seller / Buyer |
| `PROCESSING` | `SHIPPED` | Seller logs shipment + tracking | Seller |
| `SHIPPED` | `OUT_FOR_DELIVERY` | Agent scans package on route | Agent |
| `OUT_FOR_DELIVERY` | `DELIVERED` | Agent marks delivered | Agent |
| `DELIVERED` | `COMPLETED` | 7-day return window expires | System (cron) |
| `DELIVERED` | `RETURN_REQUESTED` | Buyer requests return | Buyer |
| `RETURN_REQUESTED` | `RETURNED` | QC passes at hub | System |
| `RETURN_REQUESTED` | `DELIVERED` | QC fails, item returned to buyer | System |

### SLA Rules

| Transition | SLA Window | Penalty on Breach |
|---|---|---|
| `PAID` → `PROCESSING` | 24 hours | Seller rating deducted |
| `PROCESSING` → `SHIPPED` | 48 hours | Order auto-cancelled, seller penalized |

---

## 2. Return State Machine

### States

| State | Description |
|---|---|
| `REQUESTED` | Buyer submitted return reason |
| `PICKUP_SCHEDULED` | Return pickup arranged |
| `IN_TRANSIT` | Item on its way to hub |
| `QC_PENDING` | Item received at hub, awaiting inspection |
| `QC_PASSED` | Item accepted, refund triggered |
| `QC_FAILED` | Item rejected, returned to buyer |
| `REFUNDED` | Money returned to buyer |
| `CLOSED` | Return case closed |

### Transitions

| From | To | Trigger | Who |
|---|---|---|---|
| `REQUESTED` | `PICKUP_SCHEDULED` | System assigns pickup | System |
| `PICKUP_SCHEDULED` | `IN_TRANSIT` | Agent confirms pickup | Agent |
| `IN_TRANSIT` | `QC_PENDING` | Hub scans receipt | Hub Staff |
| `QC_PENDING` | `QC_PASSED` | QC agent approves | QC Agent |
| `QC_PENDING` | `QC_FAILED` | QC agent rejects | QC Agent |
| `QC_PASSED` | `REFUNDED` | Refund API called | System |
| `REFUNDED` | `CLOSED` | Refund confirmed | System |
| `QC_FAILED` | `CLOSED` | Item re-delivered to buyer | System |

---

## 3. Dispute State Machine

### States

| State | Description |
|---|---|
| `OPEN` | Buyer opened dispute |
| `AWAITING_SELLER` | Seller notified, 72h to respond |
| `SELLER_RESPONDED` | Seller submitted their side |
| `UNDER_REVIEW` | Moderator reviewing evidence |
| `RESOLVED` | Ruling issued |
| `CLOSED` | Dispute fully closed |

### Transitions

| From | To | Trigger | Who |
|---|---|---|---|
| `OPEN` | `AWAITING_SELLER` | System notifies seller | System |
| `AWAITING_SELLER` | `SELLER_RESPONDED` | Seller submits response | Seller |
| `AWAITING_SELLER` | `UNDER_REVIEW` | 72h timeout with no seller response | System |
| `SELLER_RESPONDED` | `UNDER_REVIEW` | Buyer escalates or moderator picks up | Buyer / System |
| `UNDER_REVIEW` | `RESOLVED` | Moderator issues ruling | Moderator |
| `RESOLVED` | `CLOSED` | Actions completed (refund issued or dismissed) | System |

### Rulings

| Ruling | Action |
|---|---|
| `BUYER` | Refund initiated. Seller finance deducted. |
| `SELLER` | Dispute dismissed. Funds released to seller. |
| `SPLIT` | Partial refund to buyer, partial release to seller. |

---

## 4. Shipment State Machine

| State | Trigger | Who |
|---|---|---|
| `ASSIGNED` | Order PROCESSING, agent assigned | System |
| `PICKED_UP` | Agent scans package at seller/warehouse | Agent |
| `IN_TRANSIT` | Agent marks en route | Agent |
| `OUT_FOR_DELIVERY` | Agent starts final delivery leg | Agent |
| `DELIVERED` | Agent marks delivered + uploads proof | Agent |
| `FAILED` | Delivery attempt failed | Agent |
| `RETURNED_TO_HUB` | Package returned after failed attempts | Agent |
