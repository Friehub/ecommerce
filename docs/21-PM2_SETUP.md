# PM2 Setup Guide

## Overview

This repo already includes PM2 app definitions in:

- `ecosystem.config.js`
- `ecosystem.config.cjs`

That means you can switch to PM2 with very little extra configuration.

## Is PM2 its own runner?

Yes. PM2 is a process manager / runner for Node.js and other applications.

- `pm2` launches and monitors processes
- `pm2 ps` (or `pm2 ls`) shows the current managed process list
- `pm2` itself is the runner; `ps` is just the status command

## Minimal setup

1. Install PM2 globally or locally.

- Globally:
  ```bash
  npm install -g pm2
  ```

- Or locally in the repo:
  ```bash
  pnpm add -D pm2
  ```

2. Build the applications if needed.

This repo uses a monorepo structure, so build first if the services require it.

```bash
pnpm build
```

3. Start PM2 using the existing ecosystem config.

- For the root production config:
  ```bash
  pm2 start ecosystem.config.js
  ```

- For the staging config:
  ```bash
  pm2 start ecosystem.config.cjs --env staging
  ```

## What the configs already define

### `ecosystem.config.js`

- `fastify-api` → `./apps/api-server/dist/index.js`
- `rust-search` → `./services/target/release/search_service`
- `rust-inventory` → `./services/target/release/inventory_service`

### `ecosystem.config.cjs`

- `jumia-api` → `node dist/index.js` in `./apps/api-server`
- `jumia-web` → `node server.js` in `./apps/web/.next/standalone/apps/web`
- `jumia-workers` → `npx tsx scripts/run-workers.ts` in `./packages/api`
- `jumia-event-consumer` → `node dist/index.js` in `./services/event-consumer`

## Common PM2 commands

```bash
pm2 ps            # list running apps
pm2 logs          # view logs
pm2 restart all   # restart everything
pm2 stop all      # stop everything
pm2 delete all    # remove all processes from PM2
pm2 save          # persist current process list
pm2 startup       # generate startup script for system boot
```

## Notes

- You do not need to rewrite app entrypoints if you use the supplied config files.
- If you want to avoid extra configuration entirely, use the existing `ecosystem.config.js` / `ecosystem.config.cjs` and PM2 will manage the processes.
- `pm2 ps` is not a separate runner; it is the command that lists the current PM2-managed processes.
