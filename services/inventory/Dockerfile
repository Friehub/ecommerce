FROM rust:1.78-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY shared/Cargo.toml ./shared/
COPY inventory/Cargo.toml ./inventory/
COPY search/Cargo.toml ./search/
COPY auction/Cargo.toml ./auction/
COPY fraud/Cargo.toml ./fraud/
COPY recommendations/Cargo.toml ./recommendations/
COPY image-processor/Cargo.toml ./image-processor/

RUN mkdir -p shared/src && echo "pub fn main() {}" > shared/src/lib.rs
RUN mkdir -p inventory/src && echo "fn main() {}" > inventory/src/main.rs
RUN cargo build --release --bin inventory
RUN rm -rf shared/src inventory/src

COPY . .
RUN touch inventory/src/main.rs shared/src/lib.rs
RUN cargo build --release --bin inventory

FROM alpine:3.19 AS runner

RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=builder /app/target/release/inventory /app/inventory

USER appuser
EXPOSE 3002
ENV RUST_LOG=info
CMD ["/app/inventory"]
