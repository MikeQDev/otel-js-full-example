const { trace, SpanStatusCode } = require('@opentelemetry/api');

// Synthetic async service
exports.doWork = async ({ errorRate = 0.2, variableSleepTime = 1000, minSleepTime = 0 } = {}) => {
  await trace.getTracer('default').startActiveSpan('doWork', async (span) => {
    if (Math.random() < errorRate) {
      // errorRate% of time, requests should encounter this (i.e.: .2 = 20% errors)
      const error = new Error('Unexpected failure');
      // span.setAttribute('error', true); // I believe this does the same as setting statuscode to ERROR
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error);
      span.end();
      throw error;
    }
    await new Promise((res) =>
      //e.g.: will sleep for minSleepTime , plus up to an additional variableSleepTime in ms
      setTimeout(res, minSleepTime + Math.random() * variableSleepTime)
    );
    span.end();
  });
};
