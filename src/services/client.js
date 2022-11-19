const axios = require('axios');
// NOTE: no manual instrumentation occurs in this file; all telemetry comes from auto-instrumentation
const shopHost = 'http://localhost:21469';

(async () => {
  try {
    console.log('Finding all items at store...');
    const allItemData = (await axios.get(`${shopHost}/allItems`)).data;
    const allItemIds = allItemData.map((item) => item.id);
    const randomItem = allItemIds[Math.floor((Math.random() * 10) % allItemIds.length)];
    console.log(`Getting details for item '${randomItem}'...`);
    const { data } = await axios.get(`${shopHost}/getItem/${randomItem}`);
    console.log(`Got item from store: ${JSON.stringify(data)}`);
  } catch (e) {
    console.log(`Issue obtaining item from store! ${e.message}`);
  }
})();
