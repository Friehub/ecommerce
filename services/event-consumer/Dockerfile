FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
# Pin pnpm via corepack — matches the rest of the build pipeline
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Copy manifests first so the install layer caches correctly.
# A change to source files will NOT trigger a reinstall.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json           ./packages/api/
COPY packages/db/package.json            ./packages/db/
COPY packages/shared/package.json        ./packages/shared/
COPY services/event-consumer/package.json ./services/event-consumer/

RUN pnpm install --frozen-lockfile

# Copy source after install to preserve the install cache layer
COPY . .

RUN pnpm --filter @ecom/db generate
# Delete stale .tsbuildinfo before compiling — no need for --force
RUN find . -name '*.tsbuildinfo' -delete
RUN pnpm --filter @ecom/db exec tsc -b
RUN pnpm --filter @ecom/shared exec tsc -b
RUN pnpm --filter @ecom/api exec tsc -b
RUN pnpm --filter @ecom/event-consumer exec tsc -b

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 consumer

COPY --from=builder /app/node_modules              /app/node_modules
COPY --from=builder /app/packages                  /app/packages
COPY --from=builder /app/services/event-consumer   /app/services/event-consumer

WORKDIR /app/services/event-consumer

USER consumer

CMD ["node", "--import", "tsx", "src/index.ts"]
