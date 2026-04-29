# 07 - Security & Compliance

**Status:** Research
**Blocks:** Production readiness. Must be addressed before any real user data is handled.

---

## 1. PCI-DSS Compliance

We **never store, process, or transmit raw card data**. Paystack handles all card processing on their PCI-DSS certified infrastructure.

Our obligations:
- Use Paystack's hosted payment page or their official SDK (not a custom card form).
- Never log card numbers, CVV, or expiry dates anywhere in our system.
- Webhook payloads from Paystack contain only a masked card representation (last 4 digits + auth code for repeat charges).

---

## 2. NDPA (Nigeria Data Protection Act)

Requirements that affect the platform:

| Requirement | Implementation |
|---|---|
| Lawful basis for data processing | Privacy Policy displayed at registration; explicit consent checkbox |
| Data minimization | Collect only what is needed per module |
| Right to access | User can download their data via account settings |
| Right to deletion | User can request account deletion; anonymize rather than hard-delete |
| Data breach notification | Notify NITDA within 72 hours of a confirmed breach |
| Third-party data processors | Paystack, Resend, Cloudflare R2 all have compliant DPAs |

---

## 3. Authentication Security

| Concern | Implementation |
|---|---|
| Password storage | bcrypt with cost factor 12 |
| JWT access token TTL | 15 minutes |
| Refresh token TTL | 30 days, rotated on every use |
| Refresh token storage (web) | httpOnly, Secure, SameSite=Strict cookie |
| Refresh token storage (mobile) | Expo SecureStore (encrypted device storage) |
| MFA | TOTP (Google Authenticator) — required for Seller Hub and Admin |
| OAuth tokens | Never stored raw — only the provider account ID |

---

## 4. API Security

| Concern | Implementation |
|---|---|
| CSRF | tRPC uses POST with content-type:application/json. SameSite cookies prevent CSRF. |
| Input validation | Zod schemas on every tRPC procedure input |
| SQL injection | Prisma parameterized queries — no raw SQL with user input |
| XSS | Next.js escapes React output by default. CSP headers set. |
| Rate limiting | Redis-backed rate limiter on all endpoints |
| Webhook verification | HMAC-SHA512 signature check on Paystack webhooks |

---

## 5. Rate Limiting Strategy

| Endpoint | Limit |
|---|---|
| Auth (login, register) | 10 requests / 15 min per IP |
| Checkout / payments.initiate | 5 requests / min per user |
| Search | 60 requests / min per IP |
| Rust Inventory Reservation | 100 requests / sec per IP (Redis atomic counter) |
| Rust Ad Auction | Internal only, no external rate limit |
| Admin endpoints | 30 requests / min per admin user |

---

## 6. Secrets Management

- All secrets stored in environment variables, never in source code.
- Local development: `.env.local` (gitignored).
- Production: Doppler or Vercel/Railway environment variable management.
- Secrets rotation: Paystack keys, database URLs, and JWT secrets rotated every 90 days.

---

## 7. Data Encryption

| Data | Encryption |
|---|---|
| Passwords | bcrypt hash (one-way) |
| Database at rest | PostgreSQL encryption (managed provider handles this) |
| Media files | Cloudflare R2 server-side encryption |
| Refresh tokens | Stored as SHA-256 hash in DB, raw value only in cookie/SecureStore |

---

## 8. Infrastructure Security

| Concern | Implementation |
|---|---|
| Database access | Not exposed to the internet; accessed only via app server |
| Redis access | Internal network only; AUTH password set |
| Rust services | Internal network only; no public exposure |
| DDoS protection | Cloudflare (web), rate limiting at app level |
| Dependency vulnerabilities | `npm audit` in CI; Dependabot alerts |
| Logging | No PII in logs (mask email, phone, card references) |
