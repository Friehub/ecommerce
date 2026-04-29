# 13 - Monitoring & Observability

**Status:** Lower Priority — add incrementally after core modules run.

---

## Three Pillars

| Pillar | Tool | Purpose |
|---|---|---|
| **Metrics** | Prometheus + Grafana | Quantitative measurements over time |
| **Traces** | OpenTelemetry + Jaeger | Request flow across modules and services |
| **Logs** | Structured JSON logs → Loki | Queryable event records |

---

## Key Metrics to Track

### Business Metrics (Grafana dashboards)

| Metric | Description |
|---|---|
| GMV per hour | Total order value placed |
| Checkout conversion rate | Cart → Order / Cart sessions |
| Payment success rate | Successful payments / payment attempts |
| Active flash sale stock level | Real-time remaining units |
| Orders per minute | Spike detection |

### Infrastructure Metrics

| Metric | Alert Threshold |
|---|---|
| API p99 latency | > 2 seconds |
| Error rate (5xx) | > 1% of requests |
| DB connection pool saturation | > 80% |
| Redis memory usage | > 70% |
| Rust service response time | > 50ms |
| BullMQ queue depth | > 1000 pending jobs |

---

## OpenTelemetry Instrumentation

Every tRPC procedure is automatically traced via middleware.

Trace spans include:
- Procedure name
- User ID (hashed)
- Duration
- Error type if failed

Rust services emit traces via the `tracing` crate + `opentelemetry-rust`.

---

## Structured Logging

All logs are JSON with consistent fields:

```json
{
  "level": "error",
  "timestamp": "2026-04-29T12:00:00Z",
  "service": "orders",
  "traceId": "abc123",
  "userId": "usr_xyz",
  "event": "order.create.failed",
  "reason": "OUT_OF_STOCK",
  "variantId": "var_001"
}
```

**No PII in logs:** User IDs are hashed. Email and phone are never logged.

---

## Alerting

| Alert | Channel | Severity |
|---|---|---|
| Payment success rate drops below 90% | Slack #ops | Critical |
| Error rate > 1% | Slack #ops | High |
| Fraud BLOCK action triggered | Slack #fraud | High |
| Seller payout transfer failed | Slack #finance | High |
| API p99 > 2s for 5 minutes | Slack #ops | Medium |
| BullMQ DLQ message count > 10 | Slack #ops | Medium |

---

## Health Check Endpoints

Every service exposes:

```
GET /health
→ 200 { status: "ok", db: "ok", redis: "ok", version: "1.0.0" }
→ 503 { status: "degraded", db: "ok", redis: "error" }
```

Rust services:
```
GET /health
→ 200 { status: "ok", index: "ready", uptime_secs: 3600 }
```

Used by load balancer health checks and uptime monitoring.
