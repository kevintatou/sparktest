# Build stage  
FROM rust:latest as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace files
COPY Cargo.toml Cargo.lock ./
COPY backend/controller ./backend/controller
COPY backend/core ./backend/core
COPY backend/api ./backend/api
COPY backend/bin ./backend/bin

# Build the controller
WORKDIR /app/backend/controller
RUN cargo build --release

# Runtime stage
FROM debian:trixie-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 sparktest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/sparktest-controller /app/sparktest-controller

# Set ownership
RUN chown -R sparktest:sparktest /app

USER sparktest

EXPOSE 8080

ENTRYPOINT ["/app/sparktest-controller"]
