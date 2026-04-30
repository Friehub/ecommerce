#!/bin/bash

# Start all Rust services in the background
cd services

echo "Starting Search Service (3001)..."
RUST_LOG=search=info cargo run --bin search > search.log 2>&1 &

echo "Starting Inventory Service (3002)..."
RUST_LOG=inventory=info cargo run --bin inventory > inventory.log 2>&1 &

echo "Starting Auction Service (3003)..."
RUST_LOG=auction=info cargo run --bin auction > auction.log 2>&1 &

echo "Starting Fraud Service (3004)..."
RUST_LOG=fraud=info cargo run --bin fraud > fraud.log 2>&1 &

echo "Starting Recommendations Service (3005)..."
RUST_LOG=recommendations=info cargo run --bin recommendations > recommendations.log 2>&1 &

echo "Starting Image Processor (3006)..."
RUST_LOG=image_processor=info cargo run --bin image-processor > image_processor.log 2>&1 &

echo "All services starting. Check .log files for details."
