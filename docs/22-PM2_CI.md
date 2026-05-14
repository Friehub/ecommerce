# PM2 and CI Deployment Guide

## What the current CI does

This repo has three GitHub Actions workflows:

- `.github/workflows/ci.yml` — checks TypeScript, lint, audit, and Rust on pushes/PRs.
- `.github/workflows/deploy-production.yml` — production deploy on `main`.
- `.github/workflows/deploy-staging.yml` — staging deploy on `staging`.

## Production CI

The production pipeline is currently NOT using PM2.

Key behavior in `deploy-production.yml`:

- Runs on a self-hosted runner.
- Validates code, installs dependencies, generates Prisma client, runs typecheck and Rust checks.
- Builds Docker images using `docker-compose.prod.yml`.
- Syncs repository content to `/opt/jumia/` on the production host.
- Runs database migrations via `docker compose -f docker-compose.prod.yml`.
- Deploys services with `docker compose up -d --build ...`.
- Reloads Nginx and performs a smoke test.
- Has a rollback job that restores the last successful SHA if deploy fails.

### What this means

- Production deploys are currently based on Docker Compose, not `pm2`.
- The existing `ecosystem.config.js` file is not referenced by `deploy-production.yml`.
- If you want production to use PM2, the deploy job must be changed to build and run services through PM2 instead of Docker Compose.

## Staging CI with PM2

The staging workflow already uses PM2 in `deploy-staging.yml`.

Key behavior:

- Runs on a self-hosted runner for the `staging` branch.
- Installs Node dependencies and generates the Prisma client.
- Syncs repo files to `/opt/runner-work/jumia-staging/`.
- Starts staging Postgres via `docker compose -f docker-compose.staging.yml`.
- Runs staging DB reset/migrations and seed.
- Builds the app with `pnpm build`.
- Deploys with PM2 using `ecosystem.config.cjs`:
  - `pm2 startOrReload ecosystem.config.cjs --env staging --update-env`
- Runs a staging smoke test against `http://localhost:4000/health`.

### What `ecosystem.config.cjs` defines for staging

- `jumia-api` → `node dist/index.js` in `./apps/api-server`
- `jumia-web` → `node server.js` in `./apps/web/.next/standalone/apps/web`
- `jumia-workers` → `npx tsx scripts/run-workers.ts` in `./packages/api`
- `jumia-event-consumer` → `node dist/index.js` in `./services/event-consumer`

### Why this is useful

- Staging already has a simple PM2 deploy path.
- `pm2 startOrReload` keeps process definitions stable and updates the running apps.
- The staging pipeline handles PM2 installation if it is missing on the host.

## Practical guidance

### Use staging PM2 as-is

If you want a working PM2 flow for staging, use the existing workflow and config.

- Ensure the staging host has PM2 available, or let the workflow install it.
- Keep `ecosystem.config.cjs` in sync with staging entrypoints.
- The workflow already reloads the staging app with `--update-env`.

### If you want production to use PM2 too

The production workflow will need a migration from `docker compose` to PM2:

- Replace or complement the production deploy steps.
- Use `ecosystem.config.js` or a dedicated production ecosystem file.
- Build the app artifacts before running PM2.
- Run pm2 commands on the production host instead of `docker compose up`.

## Summary

- `ci.yml` is the validation pipeline.
- `deploy-production.yml` is Docker Compose based and currently does not use PM2.
- `deploy-staging.yml` already uses PM2 via `ecosystem.config.cjs`.
- `pm2 ps` is just the PM2 process listing command; PM2 itself is the runner.
