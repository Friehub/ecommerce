module.exports = {
  apps: [
    {
      name: 'fastify-api',
      script: './packages/api/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'rust-search',
      script: './services/target/release/search_service',
      exec_mode: 'fork',
      env: {
        PORT: 3001
      }
    },
    {
      name: 'rust-inventory',
      script: './services/target/release/inventory_service',
      exec_mode: 'fork',
      env: {
        PORT: 3002
      }
    }
  ]
};
