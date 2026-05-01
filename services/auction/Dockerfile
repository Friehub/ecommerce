FROM rust:1.78-alpine AS builder
RUN apk add --no-cache musl-dev pkgconfig openssl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY shared/Cargo.toml ./shared/
COPY auction/Cargo.toml ./auction/
COPY search/Cargo.toml ./search/
COPY inventory/Cargo.toml ./inventory/
COPY fraud/Cargo.toml ./fraud/
COPY recommendations/Cargo.toml ./recommendations/
COPY image-processor/Cargo.toml ./image-processor/
RUN mkdir -p shared/src && echo "pub fn main() {}" > shared/src/lib.rs
RUN mkdir -p auction/src && echo "fn main() {}" > auction/src/main.rs
RUN cargo build --release --bin auction
RUN rm -rf shared/src auction/src
COPY . .
RUN touch auction/src/main.rs shared/src/lib.rs
RUN cargo build --release --bin auction
FROM alpine:3.19 AS runner
RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/target/release/auction /app/auction
USER appuser
EXPOSE 3003
ENV RUST_LOG=info
CMD ["/app/auction"]
