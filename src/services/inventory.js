const express = require('express');
const app = express();
const PORT = 21470;

app.get('/products', function (req, res) {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`Inventory listening on port ${PORT}`);
});
