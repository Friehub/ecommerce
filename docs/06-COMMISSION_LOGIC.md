# 06 - Commission & Settlement Logic

**Status:** Research
**Blocks:** Seller Finance module, payout cron job.

---

## Commission Structure

Commission rates are set per category. They are deducted from the seller's gross sales.

| Category | Commission Rate |
|---|---|
| Phones & Tablets | 5% |
| Electronics | 7% |
| Computers | 5% |
| Appliances | 8% |
| Fashion | 15% |
| Health & Beauty | 12% |
| Home & Office | 10% |
| Baby Products | 12% |
| Groceries | 8% |
| Gaming | 7% |

Rates are stored in the `Category` table (`commission_rate` field) so they can be updated without a code deploy.

---

## Settlement Calculation

```
Gross Sales (GMV of completed orders in the period)
  − Returned Orders (items returned and refunded in the period)
= Net Sales (NMV)
  − Platform Commission (NMV × category commission_rate)
  − Advertising Spend (total ad_spend debited in the period)
  − Penalties (SLA breaches, false delivery claims)
= Net Payout (disbursed to seller bank account)
```

---

## Ledger Entries

Every financial event creates a `SellerLedgerEntry` record. The statement is a sum of these entries for a period.

| Event | Entry Type | Amount |
|---|---|---|
| Order line delivered (7-day window passed) | `SALE` | + order line total |
| Platform commission deducted | `COMMISSION` | − (sale × commission_rate) |
| Ad click charged | `AD_SPEND` | − CPC bid amount |
| SLA breach penalty | `PENALTY` | − fixed penalty amount |
| Refund approved | `REFUND` | − refund amount |
| Return rejected (item stays with seller) | `REFUND_REVERSAL` | + refund amount |

---

## Escrow Timeline

```
Order DELIVERED
  → Escrow timer starts (7 days)
  → Day 0–7: Buyer can open a return
  → Day 7 (no return): order.completed event fired
  → SellerLedgerEntry SALE created
  → Funds eligible for next settlement cycle
```

If a return is opened during the 7-day window, the escrow extends until the return is resolved.

---

## Settlement Cycle

- Statements are generated every **Monday at 00:00 UTC** for the previous Monday–Sunday period.
- Payouts are sent on the same day via Paystack Transfer.
- Sellers with net payout < ₦1,000 are rolled over to the next cycle.
- Sellers with active disputes on their orders have those specific order amounts held until disputes resolve.

---

## Penalty Schedule

| Breach | Penalty |
|---|---|
| Seller fails to process order within 24h | ₦500 per order |
| Seller fails to ship within 48h of processing | ₦1,000 per order |
| False delivery claim (marked delivered, not received) | ₦2,500 per incident + rating deduction |
| Counterfeit item confirmed | Full order refund + ₦10,000 fine + potential suspension |

Penalties are applied as `PENALTY` ledger entries and deducted from the next statement.

---

## Seller Rating Impact

Seller rating (1.0–5.0) is a weighted average:

| Factor | Weight |
|---|---|
| Buyer review score | 50% |
| On-time shipment rate | 25% |
| Order cancellation rate | 15% |
| Dispute loss rate | 10% |

Rating below 3.0 triggers a review. Below 2.0 triggers automatic suspension.
