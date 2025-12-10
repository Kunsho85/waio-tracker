# Build stage
FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Production stage
FROM oven/bun:1.3-slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000
CMD ["bun", "run", "src/index.tsx"]
