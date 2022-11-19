const axios = require('axios');
const { trace, SpanStatusCode } = require('@opentelemetry/api');

const shopHost = 'http://localhost:21469';

const tracer = trace.getTracer('default');

(async () => {
  await tracer.startActiveSpan('client main span', async (span) => {
    try {
      span.addEvent('Finding all items at store...');
      const allItemData = (await axios.get(`${shopHost}/allItems`)).data;
      const allItemIds = allItemData.map((item) => item.id);
      const randomItem = allItemIds[Math.floor((Math.random() * 10) % allItemIds.length)];
      span.addEvent(`Getting details for item '${randomItem}'...`);
      const { data } = await axios.get(`${shopHost}/getItem/${randomItem}`);
      span.addEvent(`Got item from store: ${JSON.stringify(data)}`);
    } catch (e) {
      span.addEvent(`Issue obtaining item from store! ${e.message}`);
      // optionally, set parent span status to error and record exception
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(e);
    } finally {
      span.end();
    }
  });
})();
