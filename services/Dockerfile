# ─────────────────────────────────────────────────────────────────────────────
# Workspace Dockerfile — builds ALL Rust services in a single cargo-chef pass.
# Each service is a separate final stage, selected with --target at build time.
# Benefits:
#   - cargo-chef runs ONCE → deps cached in one shared layer (~6GB vs 7 × 6GB)
#   - All binaries compiled in a single `cargo build` invocation (shared registry)
#   - Only dependency-layer cache is invalidated when Cargo.lock changes
#   - Source changes only trigger the builder stage (fast incremental)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Chef base ────────────────────────────────────────────────────────
FROM lukemathwalker/cargo-chef:latest-rust-alpine AS chef
WORKDIR /app
RUN apk add --no-cache musl-dev pkgconfig openssl-dev protobuf-dev

# ── Stage 2: Planner — compute the dependency recipe for the whole workspace ──
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ── Stage 3: Cacher — cook ALL workspace dependencies ONCE ───────────────────
FROM chef AS cacher
COPY --from=planner /app/recipe.json recipe.json
# Cook all features needed by any service so the cache is complete
RUN cargo chef cook --release --recipe-path recipe.json

# ── Stage 4: Builder — compile all service binaries ──────────────────────────
FROM chef AS builder
COPY . .
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
RUN cargo build --release \
    --bin search \
    --bin inventory \
    --bin fraud \
    --bin recommendations \
    --bin auction \
    --bin image-processor

# ── Runtime base (reused by all service stages) ───────────────────────────────
FROM alpine:3.19 AS base-runner
RUN apk add --no-cache ca-certificates tzdata libpq libgcc libstdc++
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# ── Stage 5a: search ──────────────────────────────────────────────────────────
FROM base-runner AS search-runner
RUN mkdir -p /data/index && chown -R appuser:appgroup /app /data
COPY --from=builder /app/target/release/search /app/search
USER appuser
EXPOSE 3001
ENV RUST_LOG=info
CMD ["/app/search"]

# ── Stage 5b: inventory ───────────────────────────────────────────────────────
FROM base-runner AS inventory-runner
COPY --from=builder /app/target/release/inventory /app/inventory
USER appuser
EXPOSE 3002
ENV RUST_LOG=info
CMD ["/app/inventory"]

# ── Stage 5c: fraud ───────────────────────────────────────────────────────────
FROM base-runner AS fraud-runner
COPY --from=builder /app/target/release/fraud /app/fraud
USER appuser
EXPOSE 3004
ENV RUST_LOG=info
CMD ["/app/fraud"]

# ── Stage 5d: recommendations ─────────────────────────────────────────────────
FROM base-runner AS recommendations-runner
COPY --from=builder /app/target/release/recommendations /app/recommendations
USER appuser
EXPOSE 3005
ENV RUST_LOG=info
CMD ["/app/recommendations"]

# ── Stage 5e: auction ─────────────────────────────────────────────────────────
FROM base-runner AS auction-runner
COPY --from=builder /app/target/release/auction /app/auction
USER appuser
EXPOSE 50051
ENV RUST_LOG=info
CMD ["/app/auction"]

# ── Stage 5f: image-processor ────────────────────────────────────────────────
FROM base-runner AS image-processor-runner
COPY --from=builder /app/target/release/image-processor /app/image-processor
USER appuser
EXPOSE 3006
ENV RUST_LOG=info
CMD ["/app/image-processor"]
