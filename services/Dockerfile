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

# ── Stage 5a: search ──────────────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12:nonroot AS search-runner
WORKDIR /app
# Note: Data index directory must be handled via volumes/init containers in k8s/compose
# since we can't 'mkdir' or 'chown' in a shell-less distroless image easily without a sidecar.
# For Docker Compose, the volume mount will handle directory creation.
COPY --from=builder /app/target/release/search /app/search
EXPOSE 3001
ENV RUST_LOG=info
CMD ["/app/search"]

# ── Stage 5b: inventory ───────────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12:nonroot AS inventory-runner
WORKDIR /app
COPY --from=builder /app/target/release/inventory /app/inventory
EXPOSE 3002
ENV RUST_LOG=info
CMD ["/app/inventory"]

# ── Stage 5c: fraud ───────────────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12:nonroot AS fraud-runner
WORKDIR /app
COPY --from=builder /app/target/release/fraud /app/fraud
EXPOSE 3004
ENV RUST_LOG=info
CMD ["/app/fraud"]

# ── Stage 5d: recommendations ─────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12:nonroot AS recommendations-runner
WORKDIR /app
COPY --from=builder /app/target/release/recommendations /app/recommendations
EXPOSE 3005
ENV RUST_LOG=info
CMD ["/app/recommendations"]

# ── Stage 5e: auction ─────────────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12:nonroot AS auction-runner
WORKDIR /app
COPY --from=builder /app/target/release/auction /app/auction
EXPOSE 50051
ENV RUST_LOG=info
CMD ["/app/auction"]

# ── Stage 5f: image-processor ────────────────────────────────────────────────
FROM gcr.io/distroless/cc-debian12:nonroot AS image-processor-runner
WORKDIR /app
COPY --from=builder /app/target/release/image-processor /app/image-processor
EXPOSE 3006
ENV RUST_LOG=info
CMD ["/app/image-processor"]
