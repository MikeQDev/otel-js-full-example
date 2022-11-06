const { metrics } = require('@opentelemetry/api-metrics');
const { trace } = require('@opentelemetry/api');
const { doWork } = require('./services/syntheticWorker.js');

// Obtain instruments, used to generate telemetry
const tracer = trace.getTracer('myTracer');
const failureCounter = metrics.getMeter('default').createCounter('failureCount', {
  description: 'total amount of failed responses',
  unit: 'invocations',
});
const latencyHistogram = metrics.getMeter('default').createHistogram('workLatency', {
  description: 'time taken to do work',
  unit: 'milliseconds',
});

// Main logic
(async () => {
  await tracer.startActiveSpan('main batch process', async (span) => {
    for (let i = 0; i < 10; i++) {
      await tracer.startActiveSpan('process item', async (span) => {
        const startTime = new Date();
        try {
          await doWork();
        } catch (e) {
          // redundant acting on this span, since doWork has its own span that captures errors
          // span.recordException(e);
          // span.setStatus({ code: SpanStatusCode.ERROR });
          failureCounter.add(1);
        } finally {
          span.end();
          latencyHistogram.record(new Date() - startTime);
        }
      });
    }
    span.end(); // MUST end your spans, else they won't be captured
  });
  setTimeout(() => console.log('bye'), 4000); // timeout to allow exporters to finish. Or should we explicitly flush here?. Lifecycle hooks in FaaS should remove this concern
})();
