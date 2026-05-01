FROM rust:1.78-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY shared/Cargo.toml ./shared/
COPY fraud/Cargo.toml ./fraud/
COPY search/Cargo.toml ./search/
COPY inventory/Cargo.toml ./inventory/
COPY auction/Cargo.toml ./auction/
COPY recommendations/Cargo.toml ./recommendations/
COPY image-processor/Cargo.toml ./image-processor/

RUN mkdir -p shared/src && echo "pub fn main() {}" > shared/src/lib.rs
RUN mkdir -p fraud/src && echo "fn main() {}" > fraud/src/main.rs
RUN cargo build --release --bin fraud
RUN rm -rf shared/src fraud/src

COPY . .
RUN touch fraud/src/main.rs shared/src/lib.rs
RUN cargo build --release --bin fraud

FROM alpine:3.19 AS runner
RUN apk add --no-cache ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/target/release/fraud /app/fraud
USER appuser
EXPOSE 3004
ENV RUST_LOG=info
CMD ["/app/fraud"]
