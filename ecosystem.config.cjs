const path = require('path');
const fs = require('fs');
const ROOT = __dirname;

// Manual env loader to be 100% sure variables are injected
function getEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const stagingEnv = {
  ...getEnv(),
  NODE_ENV: 'production',
};

module.exports = {
  apps: [
    {
      name: 'jumia-api',
      script: 'node dist/index.js',
      cwd: path.join(ROOT, 'apps/api-server'),
      env: {
        ...stagingEnv,
        PORT: 4000
      }
    },
    {
      name: 'jumia-web',
      script: 'node apps/web/server.js',
      cwd: path.join(ROOT, 'apps/web/.next/standalone'),
      env: {
        ...stagingEnv,
        PORT: 3000,
        HOSTNAME: '127.0.0.1'
      }
    },
    {
      name: 'jumia-workers',
      script: 'npx tsx scripts/run-workers.ts',
      cwd: path.join(ROOT, 'packages/api'),
      env: stagingEnv
    },
    {
      name: 'jumia-event-consumer',
      script: 'node dist/index.js',
      cwd: path.join(ROOT, 'services/event-consumer'),
      env: stagingEnv
    }
  ]
};
