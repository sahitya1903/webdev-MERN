const express = require('express');
const { toRupees } = require('../services/pricing');

const publicView = (p) => ({ ...p, price: toRupees(p.price), inStock: p.stock > 0 });

function productRoutes({ repo, carts }) {
  const router = express.Router();

  // GET /api/products?category=Workspace
  router.get('/', (req, res) => {
    const { category } = req.query;
    const products = repo.listProducts().filter((p) => !category || p.category === category);
    res.json(products.map(publicView));
  });

  router.get('/:sku', (req, res) => {
    res.json(publicView(carts.product(req.params.sku)));
  });

  return router;
}

module.exports = { productRoutes };
