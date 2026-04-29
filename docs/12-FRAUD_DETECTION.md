# 12 - Fraud Detection

**Status:** Lower Priority — rule-based first, ML later.

---

## Fraud Vectors

| Vector | Description |
|---|---|
| Account Takeover | Stolen credentials used to place orders |
| Payment Fraud | Stolen card / bank details |
| Promo Abuse | Creating multiple accounts to claim coupons repeatedly |
| Seller Fraud | Fake listings, counterfeit goods, false delivery claims |
| Review Manipulation | Sellers buying fake reviews or suppressing real ones |
| Refund Abuse | Buyers claiming items not received when they were |

---

## Phase 1: Rule-Based Scoring (Build First)

Each order/account action is scored by a set of rules. If score exceeds a threshold, action is REVIEW or BLOCK.

### Order Fraud Rules

| Rule | Signal | Points |
|---|---|---|
| New account (< 7 days) + high-value order (> ₦100k) | Risk | +30 |
| Shipping address added < 1 hour before order | Risk | +20 |
| VPN / proxy detected (IP reputation API) | Risk | +25 |
| Device fingerprint seen on 3+ accounts | Risk | +40 |
| Multiple failed payment attempts this session | Risk | +15 per failure |
| Order matches a previous fraudulent order pattern | Risk | +50 |
| Buyer has > 3 completed orders | Trust | −20 |
| Buyer email is verified | Trust | −10 |

### Scoring Thresholds

| Score | Action |
|---|---|
| 0–39 | ALLOW — process normally |
| 40–69 | REVIEW — flag for human review, allow order |
| 70+ | BLOCK — reject order, prompt contact support |

---

## Phase 2: ML Model (Production)

**Model type:** Gradient Boosted Trees (XGBoost / LightGBM).

**Features (30+):**
- Account age, order history, average order value
- IP risk score, device fingerprint entropy
- Time since last login, time since address added
- Velocity: orders in last 24h, 7d
- Category of items ordered (high-risk: electronics)
- Payment method (card = higher risk than wallet for new accounts)
- Shipping to new vs saved address

**Training data:** Historical orders labeled FRAUD / LEGIT (from chargebacks and confirmed fraud cases).

**Inference:** Rust service (Axum + Candle) called synchronously at checkout. Must complete in < 100ms.

---

## Seller Fraud Detection

| Signal | Check |
|---|---|
| Fake delivery claims | Cross-reference agent GPS data with claimed delivery location |
| Review manipulation | Flag reviews from accounts created within 7 days of the order |
| Counterfeit listings | Image similarity check against known brand images |
| Sudden sales spike | Orders 10x normal velocity in 24h → flag for review |

---

## Promo Abuse Detection

| Rule | Action |
|---|---|
| Same device fingerprint on multiple accounts | Block coupon redemption, flag accounts |
| Same phone number on multiple accounts | Allow only one coupon use |
| Coupon used, order cancelled, coupon reused | Detect cycle: block after 2nd attempt |

---

## Fraud Response Actions

| Action | Effect |
|---|---|
| `ALLOW` | Normal flow |
| `REVIEW` | Order placed, flagged in admin fraud queue, monitored |
| `BLOCK` | Order rejected, user shown generic error (do not reveal detection) |
| `SUSPEND` | Account suspended, user notified to contact support |
| `BLACKLIST` | IP / device / email added to blocklist |
