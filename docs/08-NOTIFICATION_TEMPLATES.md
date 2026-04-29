# 08 - Notification Templates

**Status:** Research
**Blocks:** Notification module, all state machine transitions.

---

## Channel Matrix

Every event that requires user communication maps to one or more channels.

| Priority | Channel | When to Use |
|---|---|---|
| Critical | SMS | Payment confirmations, OTP, delivery alerts |
| High | Push | Order status changes, flash sale alerts |
| Standard | Email | Order receipts, statements, dispute updates |
| Low | In-App Inbox | Recommendations, promotions |

---

## Buyer Notifications

| Event | SMS | Push | Email |
|---|---|---|---|
| `order.created` | "Order #X confirmed. Total: ₦Y" | "Your order is confirmed" | Full order receipt |
| `payment.confirmed` | "Payment of ₦Y received for Order #X" | - | Payment confirmation |
| `payment.failed` | "Payment failed for Order #X. Retry here: [link]" | "Payment failed" | Retry instructions |
| `order.processing` | - | "Seller is preparing your order" | - |
| `shipment.created` | "Order #X has been shipped. Track: [link]" | "Your order is on the way" | Shipping confirmation with tracking |
| `shipment.out_for_delivery` | "Your order is out for delivery today" | "Out for delivery" | - |
| `shipment.delivered` | "Order #X delivered. Happy? Rate your order: [link]" | "Order delivered" | Delivery confirmation + review prompt |
| `return.qc_passed` | "Return approved. Refund of ₦Y in 3–5 days" | "Refund approved" | Refund details |
| `return.qc_failed` | "Return rejected. Item returned to you. See reason: [link]" | "Return rejected" | Full rejection reason |
| `dispute.opened` | - | "Dispute opened on Order #X" | Dispute acknowledgment |
| `dispute.resolved` | - | "Your dispute has been resolved" | Resolution details |
| `wallet.credited` | "₦Y added to your JumiaPay wallet" | "Wallet funded" | - |

---

## Seller Notifications

| Event | SMS | Push | Email |
|---|---|---|---|
| `order.created` (new order) | "New order #X. Process within 24h" | "New order received" | Full order details |
| `order.cancelled` (by buyer) | "Order #X cancelled by buyer" | "Order cancelled" | - |
| `stock.low` | - | "Low stock: [Product] has X units left" | - |
| `dispute.opened` | "Dispute opened on Order #X. Respond within 72h" | "New dispute" | Dispute details + response link |
| `dispute.resolved` | - | "Dispute resolved: [BUYER/SELLER]" | Resolution + financial impact |
| `statement.ready` | - | "Your weekly statement is ready" | Full statement PDF |
| `payout.sent` | "₦Y payout sent to your bank account" | "Payout sent" | Payout confirmation |
| `seller.approved` | "Your seller account is approved. Start selling!" | "Account approved" | Welcome + next steps |
| `campaign.budget_exhausted` | - | "Ad campaign [Name] budget exhausted" | Top-up instructions |

---

## Delivery Agent Notifications

| Event | Push | Notes |
|---|---|---|
| New delivery assigned | "You have X new deliveries for today" | Sent at 7 AM each day |
| Delivery re-routed | "Order #X re-assigned to you" | Real-time |
| Failed delivery re-attempt | "Schedule re-attempt for Order #X" | Sent next morning |

---

## Admin / Ops Notifications

Delivered via in-app inbox and Slack webhook (internal).

| Event | Alert |
|---|---|
| Fraud flag raised (BLOCK action) | Immediate Slack alert |
| Dispute escalated (no seller response) | Moderator queue notification |
| Payout transfer failed | Finance team Slack alert |
| Seller suspended automatically | Ops team notification |

---

## Template Variables

All templates use a consistent variable system:

| Variable | Example |
|---|---|
| `{{order_id}}` | ORD-2026-0001 |
| `{{amount}}` | ₦15,500 |
| `{{product_name}}` | Samsung Galaxy A56 |
| `{{tracking_url}}` | https://platform.com/track/SHIP-001 |
| `{{seller_name}}` | TechZone Store |
| `{{dispute_url}}` | https://platform.com/disputes/DIS-001 |
| `{{statement_period}}` | Apr 21 – Apr 27, 2026 |

---

## Notification Preferences

Users can disable non-critical channels per event type.
SMS for payment confirmation and OTP cannot be disabled.
