FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build server
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build:server

# Build widget
FROM base AS widget-builder
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile
COPY web/ .
RUN bun run build

# Combine builds
FROM base AS final-builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/data ./data
COPY --from=widget-builder /app/web/dist ./web/dist

# Production
FROM oven/bun:1.3-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=final-builder /app/dist ./dist
COPY --from=final-builder /app/node_modules ./node_modules
COPY --from=final-builder /app/package.json ./
COPY --from=final-builder /app/data ./data
COPY --from=final-builder /app/web/dist ./web/dist

EXPOSE 3000

CMD ["bun", "dist/index.js"]
