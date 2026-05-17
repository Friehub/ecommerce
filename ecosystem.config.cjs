const path = require('path');
const fs = require('fs');
const ROOT = __dirname;

// Manual env loader to be 100% sure variables are injected
function getEnv() {
  const candidates = ['.env', '.env.staging', '.env.prod', '.env.production', '.env.local'];
  let envPath = '';
  for (const candidate of candidates) {
    const p = path.join(ROOT, candidate);
    if (fs.existsSync(p)) {
      envPath = p;
      break;
    }
  }
  if (!envPath) {
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
  SKIP_ENV_VALIDATION: 'true',
  AWS_SDK_JS_NODE_VERSION_SUPPORT_WARNING_DISABLED: 'true',
};

module.exports = {
  apps: [
    {
      name: 'jumia-api',
      script: 'dist/index.js',
      cwd: path.join(ROOT, 'apps/api-server'),
      env: {
        ...stagingEnv,
        PORT: 4000
      }
    },
    {
      name: 'jumia-web',
      script: 'apps/web/server.js',
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
