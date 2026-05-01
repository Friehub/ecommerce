FROM rust:alpine AS builder
RUN apk add --no-cache musl-dev pkgconfig openssl-dev protobuf-dev
WORKDIR /app
# Now copy actual source and build
COPY . .
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
