const express = require('express');
const { doWork } = require('./syntheticWorker');
const app = express();
const PORT = 21470;

// TODO: replace this with sqlite DB once sqlite instrumentation is available
const initialInventory = {
  1000: {
    name: 'oranges',
    price: 2.05,
    quantity: 10,
  },
  1500: {
    name: 'bananas',
    price: 1.99,
    quantity: 80,
  },
  2000: {
    name: 'apples',
    price: 2.95,
    quantity: 30,
  },
};

app.get('/products', function (req, res) {
  res.send(initialInventory);
});

app.get('/products/:id', async function (req, res) {
  const productId = req.params.id;
  try {
    // TODO: figure out how to add doWork as a child span of /products/:id
    await doWork({ errorRate: 0.05, minSleepTime: 75 }); // Simulate DB call
    const product = initialInventory[productId];
    if (product) {
      res.send(product);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    // trace.getActiveSpan().recordException(e); // Redundant, since worker captures error in own span
    // Further thoughts: if not redundant, how about recording error in a middleware layer?
    // NOTE: setting 500 status, express instrumentation will automatically set
    // the span statuscode to error/tag the parent span (GET /products/:id) with error=true
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Inventory listening on port ${PORT}`);
});
