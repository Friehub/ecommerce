import { Registry, Histogram, collectDefaultMetrics } from 'prom-client';
import http from 'http';

export const registry = new Registry();

// Add default metrics (CPU, RAM, etc.)
collectDefaultMetrics({ register: registry });

// Histogram for order worker latency
export const orderProcessingLatency = new Histogram({
  name: 'order_worker_processing_latency_seconds',
  help: 'Latency of order worker processing in seconds',
  labelNames: ['job_name'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [registry]
});

// Create a metrics server
export function startMetricsServer(port: number = 9090) {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      try {
        res.setHeader('Content-Type', registry.contentType);
        res.end(await registry.metrics());
      } catch (err) {
        res.statusCode = 500;
        res.end(err instanceof Error ? err.message : 'Unknown error');
      }
    } else if (req.url === '/health') {
      res.statusCode = 200;
      res.end('ok');
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`📈 Metrics server listening on port ${port}`);
  });

  return server;
}
