FROM node:20-slim

# Install necessary system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libnss3 \
    libasound2 \
    libxss1 \
    libxtst6 \
    libxshmfence1 \
    libglu1 \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy app manifests
COPY apps/e2e/package.json ./apps/e2e/

# Install dependencies (only what's needed for the monorepo structure)
RUN pnpm install --frozen-lockfile

# Install only Chromium for Playwright
RUN npx playwright install --with-deps chromium

# Copy source
COPY . .

# Run as non-root
USER node

# Run tests
CMD ["pnpm", "test:e2e"]
