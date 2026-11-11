// Builds the Express app. Kept separate from index.js so tests can create a
// fresh app (with a fresh in-memory repository) for every test.

const path = require('path');
const express = require('express');

const { Repository } = require('./data/repository');
const { CartService } = require('./services/CartService');
const { OrderService } = require('./services/OrderService');
const { productRoutes } = require('./routes/products');
const { userRoutes } = require('./routes/users');
const { notFoundRoute, errorHandler } = require('./middleware/errors');

function buildApp({ repo = new Repository() } = {}) {
  const carts = new CartService(repo);
  const orders = new OrderService(repo, carts);

  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public'))); // demo storefront

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/products', productRoutes({ repo, carts }));
  app.use('/api/users', userRoutes({ carts, orders }));
  app.get('/api/orders/:orderNo', (req, res) => res.json(orders.find(req.params.orderNo)));

  app.use(notFoundRoute);
  app.use(errorHandler);
  return app;
}

module.exports = { buildApp };
