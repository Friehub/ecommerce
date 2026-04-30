FROM rust:1.78-alpine AS builder
RUN apk add --no-cache musl-dev pkgconfig openssl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY shared/Cargo.toml ./shared/
COPY recommendations/Cargo.toml ./recommendations/
COPY search/Cargo.toml ./search/
COPY inventory/Cargo.toml ./inventory/
COPY auction/Cargo.toml ./auction/
COPY fraud/Cargo.toml ./fraud/
COPY image-processor/Cargo.toml ./image-processor/
RUN mkdir -p shared/src && echo "pub fn main() {}" > shared/src/lib.rs
RUN mkdir -p recommendations/src && echo "fn main() {}" > recommendations/src/main.rs
RUN cargo build --release --bin recommendations
RUN rm -rf shared/src recommendations/src
COPY . .
RUN touch recommendations/src/main.rs shared/src/lib.rs
RUN cargo build --release --bin recommendations
FROM alpine:3.19 AS runner
RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/target/release/recommendations /app/recommendations
USER appuser
EXPOSE 3005
ENV RUST_LOG=info
CMD ["/app/recommendations"]
