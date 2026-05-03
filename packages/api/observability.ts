export interface ErrorContext {
  path?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export const observability = {
  captureException(error: any, context?: ErrorContext) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      context: context || {},
    };

    // Console output for direct visibility in production log dumps
    console.error(`[Observability] CRITICAL EXCEPTION: ${errorLog.message}`, {
      context: errorLog.context,
      stack: errorLog.stack,
    });

    // Fallback: Post to Axiom / external monitoring API if configured
    const axiomDataset = process.env.AXIOM_DATASET;
    const axiomToken = process.env.AXIOM_TOKEN;

    if (axiomDataset && axiomToken) {
      fetch(`https://api.axiom.co/v1/datasets/${axiomDataset}/ingest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${axiomToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([errorLog]),
      }).catch((e) => {
        console.warn('[Observability] Failed to push error logs to Axiom:', e.message);
      });
    }

    return errorLog;
  }
};
