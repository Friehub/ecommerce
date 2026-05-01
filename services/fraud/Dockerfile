FROM rust:alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

# Now copy actual source and build
COPY . .
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
