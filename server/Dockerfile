# ── Stage 1: Install dependencies ──
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile


# ── Stage 2: Generate Prisma client ──
FROM oven/bun:1 AS prisma

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN bunx prisma generate


# ── Stage 3: Production image ──
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy everything needed at runtime
COPY --from=prisma /app/node_modules ./node_modules
COPY --from=prisma /app/src/generated ./src/generated
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

EXPOSE 4000

# Run migrations then start the server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run src/index.ts"]
