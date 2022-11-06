const axios = require('axios');
const express = require('express');
const app = express();
const PORT = 21469;

const inventoryHost = 'http://localhost:21470';

// NOTE: receiving a 404 response sets the GET request span status from axios to error
// Solutions:
// - skip autoinstrumenting HTTP/express here or unregister instrumentation, and manually instrument instead
// - search for http.status_code=500 error=true in backend
// - hooking HTTP instrumentation to unset the span status?

app.get('/', function (req, res) {
  res.send('Welcome to the store');
});

app.get('/allItems', async function (req, res) {
  await axios
    .get(`${inventoryHost}/products`)
    .then((resp) => {
      const allProductData = resp.data;
      const products = Object.keys(allProductData).map((productId) => {
        const product = allProductData[productId];
        return { name: product.name, price: product.price, inStock: product.quantity > 0 };
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
  const productId = req.params.id;
  await axios
    .get(`${inventoryHost}/products/${productId}`)
    .then((resp) => {
      const product = resp.data;
      res.send({ name: product.name, price: product.price, inStock: product.quantity > 0 });
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
});

app.listen(PORT, () => {
  console.log(`Store listening on port ${PORT}`);
});
