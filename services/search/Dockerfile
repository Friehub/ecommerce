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
RUN cargo build --release --bin search

# ── Stage 5: Minimal runtime ──────────────────────────────────
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
