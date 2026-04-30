FROM rust:1.78-alpine AS builder
RUN apk add --no-cache musl-dev pkgconfig openssl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY shared/Cargo.toml ./shared/
COPY image-processor/Cargo.toml ./image-processor/
COPY search/Cargo.toml ./search/
COPY inventory/Cargo.toml ./inventory/
COPY auction/Cargo.toml ./auction/
COPY fraud/Cargo.toml ./fraud/
COPY recommendations/Cargo.toml ./recommendations/
RUN mkdir -p shared/src && echo "pub fn main() {}" > shared/src/lib.rs
RUN mkdir -p image-processor/src && echo "fn main() {}" > image-processor/src/main.rs
RUN cargo build --release --bin image-processor
RUN rm -rf shared/src image-processor/src
COPY . .
RUN touch image-processor/src/main.rs shared/src/lib.rs
RUN cargo build --release --bin image-processor
FROM alpine:3.19 AS runner
RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/target/release/image-processor /app/image-processor
USER appuser
EXPOSE 3006
ENV RUST_LOG=info
CMD ["/app/image-processor"]
