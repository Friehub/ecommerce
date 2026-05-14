const path = require('path');
const ROOT = '/opt/runner-work/jumia-staging';

module.exports = {
  apps: [
    {
      name: 'jumia-api',
      script: 'node dist/index.js',
      cwd: path.join(ROOT, 'apps/api-server'),
      env_staging: {
        NODE_ENV: 'production',
        PORT: 4000,
      }
    },
    {
      name: 'jumia-web',
      script: 'node server.js',
      cwd: path.join(ROOT, 'apps/web/.next/standalone'),
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1'
      }
    },
    {
      name: 'jumia-workers',
      script: 'npx tsx scripts/run-workers.ts',
      cwd: path.join(ROOT, 'packages/api'),
      env_staging: {
        NODE_ENV: 'production',
      }
    },
    {
      name: 'jumia-event-consumer',
      script: 'node dist/index.js',
      cwd: path.join(ROOT, 'services/event-consumer'),
      env_staging: {
        NODE_ENV: 'production',
      }
    }
  ]
};
