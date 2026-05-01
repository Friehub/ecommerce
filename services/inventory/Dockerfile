# ── Stage 1: Chef ─────────────────────────────────────────────
FROM lukemathwalker/cargo-chef:latest-rust-alpine AS chef
WORKDIR /app
RUN apk add --no-cache musl-dev pkgconfig openssl-dev

# ── Stage 2: Planner ──────────────────────────────────────────
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ── Stage 3: Cacher ───────────────────────────────────────────
FROM chef AS cacher
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# ── Stage 4: Build ────────────────────────────────────────────
FROM chef AS builder
COPY . .
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
RUN cargo build --release --bin inventory

# ── Stage 5: Minimal runtime ──────────────────────────────────
FROM alpine:3.19 AS runner
RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/target/release/inventory /app/inventory
USER appuser
EXPOSE 3002
ENV RUST_LOG=info
CMD ["/app/inventory"]
