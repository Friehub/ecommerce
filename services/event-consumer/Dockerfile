FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm
WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ecom/db generate
RUN pnpm --filter @ecom/db exec tsc -b --force
RUN pnpm --filter @ecom/shared exec tsc -b --force
RUN pnpm --filter @ecom/api exec tsc -b --force
RUN pnpm --filter @ecom/event-consumer exec tsc -b --force

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 consumer

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/services/event-consumer /app/services/event-consumer

WORKDIR /app/services/event-consumer

USER consumer

CMD ["node", "dist/services/event-consumer/src/index.js"]
