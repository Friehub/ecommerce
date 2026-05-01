# Shared multi-stage Dockerfile template for all Rust services.
# Build from the services/ workspace root.
# Usage: docker build -f search/Dockerfile -t ecom-search .

# ── Stage 1: Build ─────────────────────────────────────────────
FROM rust:1.78-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

# Now copy actual source and build
COPY . .
RUN cargo build --release --bin search

# ── Stage 2: Minimal runtime ───────────────────────────────────
FROM alpine:3.19 AS runner

RUN apk add --no-cache ca-certificates tzdata

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
RUN mkdir -p /data/index && chown -R appuser:appgroup /app /data

COPY --from=builder /app/target/release/search /app/search

USER appuser

EXPOSE 3001
ENV RUST_LOG=info

CMD ["/app/search"]
