const { trace, metrics } = require('@opentelemetry/api');
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = 21469;

const inventoryHost = 'http://localhost:21470';
const useCache = true; // example to reduce latency by serving /getItem/:id from cache

const cache = {};

const requestLatencyHistogram = metrics
  .getMeter('default')
  .createHistogram('getItemRequestLatency', {
    description: 'time taken to serve request',
    unit: 'milliseconds',
  });

// NOTE: receiving a 404 response sets the GET request span status from axios to error
// Solutions:
// - skip autoinstrumenting HTTP/express here or unregister instrumentation, and manually instrument instead
// - search for http.status_code=500 error=true in backend
// - hooking HTTP instrumentation to unset the span status?

app.get('/', function (req, res) {
  res.send('Welcome to the store. Endpoints:\n- /allItems\n- /getItem/:id');
});

app.get('/allItems', async function (req, res) {
  await axios
    .get(`${inventoryHost}/products`)
    .then((resp) => {
      const allProductData = resp.data;
      const products = Object.keys(allProductData).map((productId) => {
        const product = allProductData[productId];
        return {
          id: productId,
          name: product.name,
          price: product.price,
          inStock: product.quantity > 0,
        };
      });
      res.send(products);
    })
    .catch(() => {
      // no need to record exception:
      // HTTP auto instrumentations for axios already record exceptions in span
      res.sendStatus(500);
    });
});

app.get('/getItem/:id', async function (req, res) {
  const startTime = new Date();
  const productId = req.params.id;
  const currentSpan = trace.getActiveSpan();
  if (useCache && productId in cache && new Date() - cache[productId].cacheTime < 10000) {
    currentSpan.setAttribute('cacheHit', true);
    currentSpan.addEvent('Cache hit - returning from cache instead of calling inventory service');
    res.send(cache[productId]); // ideally, you wouldn't want to include cache timestamp in response
    requestLatencyHistogram.record(new Date() - startTime, { usedCache: true });
  } else {
    await axios
      .get(`${inventoryHost}/products/${productId}`)
      .then((resp) => {
        const product = resp.data;
        const transformedResponse = {
          id: productId,
          name: product.name,
          price: product.price,
          inStock: product.quantity > 0,
        };
        currentSpan.setAttribute('cacheHit', false); // span operations must occur before sending response
        res.send(transformedResponse);
        cache[productId] = { ...transformedResponse, cacheTime: new Date().getTime() };
        requestLatencyHistogram.record(new Date() - startTime, { usedCache: false });
      })
      .catch((e) => {
        // no need to record exception:
        // HTTP auto instrumentations for axios already record exceptions in span
        if (e.response?.status === 404) {
          res.sendStatus(404);
        } else {
          res.sendStatus(500);
        }
      });
  }
});

app.listen(PORT, () => {
  console.log(`Store listening on port ${PORT}`);
});
