# Multi-stage build for SparkTest application
# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

# Enable corepack and set up pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package manager files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/oss/package.json ./apps/oss/
COPY packages/core/package.json ./packages/core/
COPY packages/storage-service/package.json ./packages/storage-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages and frontend
RUN pnpm build:packages && pnpm build:app

# Stage 2: Build the backend
FROM rust:1.88-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

# Copy Cargo files
COPY backend/Cargo.toml backend/Cargo.lock* ./backend/
COPY backend/core/Cargo.toml ./backend/core/
COPY backend/api/Cargo.toml ./backend/api/
COPY backend/bin/Cargo.toml ./backend/bin/

# Build dependencies (this layer will be cached)
RUN cd backend && mkdir -p core/src api/src bin/src && \
    echo "fn main() {}" > core/src/lib.rs && \
    echo "fn main() {}" > api/src/lib.rs && \
    echo "fn main() {}" > bin/src/main.rs && \
    cargo build --release && \
    rm -rf core/src api/src bin/src

# Copy source code
COPY backend/ ./backend/

# Build the application
RUN cd backend && cargo build --release

# Stage 3: Runtime
FROM node:20-alpine AS runtime

# Install dependencies for running the application
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=nextjs:nodejs /app/apps/oss/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/apps/oss/.next/static ./apps/oss/.next/static
COPY --from=frontend-builder --chown=nextjs:nodejs /app/apps/oss/public ./apps/oss/public

# Copy built backend from backend-builder
COPY --from=backend-builder /app/backend/target/release/sparktest-bin ./backend/sparktest-bin

USER nextjs

# Expose ports
EXPOSE 3000 8080

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV DATABASE_URL=sqlite:///data/sparktest.db

# Create a simple startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo '# Start backend in background' >> start.sh && \
    echo './backend/sparktest-bin &' >> start.sh && \
    echo 'BACKEND_PID=$!' >> start.sh && \
    echo '# Start frontend' >> start.sh && \
    echo 'node apps/oss/server.js &' >> start.sh && \
    echo 'FRONTEND_PID=$!' >> start.sh && \
    echo '# Wait for either process to exit' >> start.sh && \
    echo 'wait $BACKEND_PID $FRONTEND_PID' >> start.sh && \
    chmod +x start.sh

CMD ["dumb-init", "./start.sh"]