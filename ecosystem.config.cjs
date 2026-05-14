module.exports = {
  apps: [
    {
      name: 'jumia-api',
      script: 'node dist/index.js',
      cwd: './apps/api-server',
      env_staging: {
        NODE_ENV: 'production',
        PORT: 4000,
      }
    },
    {
      name: 'jumia-web',
      script: 'node server.js',
      cwd: './apps/web/.next/standalone/apps/web',
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1'
      }
    },
    {
      name: 'jumia-workers',
      script: 'npx tsx scripts/run-workers.ts',
      cwd: './packages/api',
      env_staging: {
        NODE_ENV: 'production',
      }
    },
    {
      name: 'jumia-event-consumer',
      script: 'node dist/index.js',
      cwd: './services/event-consumer',
      env_staging: {
        NODE_ENV: 'production',
      }
    }
  ]
};
