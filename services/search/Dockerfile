# Shared multi-stage Dockerfile template for all Rust services.
# Build from the services/ workspace root.
# Usage: docker build -f search/Dockerfile -t ecom-search .

# ── Stage 1: Build ─────────────────────────────────────────────
FROM rust:1.78-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

# Cache dependencies by copying manifests first
COPY Cargo.toml Cargo.lock ./
COPY shared/Cargo.toml ./shared/
COPY search/Cargo.toml ./search/
COPY inventory/Cargo.toml ./inventory/
COPY auction/Cargo.toml ./auction/
COPY fraud/Cargo.toml ./fraud/
COPY recommendations/Cargo.toml ./recommendations/
COPY image-processor/Cargo.toml ./image-processor/

# Dummy src to let cargo fetch and cache all deps
RUN mkdir -p shared/src && echo "pub fn main() {}" > shared/src/lib.rs
RUN mkdir -p search/src && echo "fn main() {}" > search/src/main.rs
RUN cargo build --release --bin search
RUN rm -rf shared/src search/src

# Now copy actual source and rebuild only what changed
COPY . .
RUN touch search/src/main.rs shared/src/lib.rs
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
