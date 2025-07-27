# Simple frontend-only deployment for SparkTest demo
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm directly
RUN npm install -g pnpm@latest

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

# Runtime stage
FROM node:20-alpine AS runtime

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/oss/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/oss/.next/static ./apps/oss/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/oss/public ./apps/oss/public

USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_USE_RUST_API=false

CMD ["dumb-init", "node", "apps/oss/server.js"]