// Everything that belongs to one shopper lives under /api/users/:userId.
//
// The userId in the URL keeps the demo simple. A real API would take the user
// from a login token (JWT / session) so nobody can touch someone else's cart.

const express = require('express');
const { badRequest } = require('../middleware/errors');

const USER_ID = /^[\w-]{1,40}$/;

function userRoutes({ carts, orders }) {
  const router = express.Router();

  router.param('userId', (req, res, next, userId) => {
    if (!USER_ID.test(userId)) return next(badRequest('userId may only contain letters, numbers, _ and -'));
    next();
  });

  // View cart + totals
  router.get('/:userId/cart', (req, res) => {
    res.json(carts.view(req.params.userId));
  });

  // 1. Add to cart            { "sku": "SKU-101", "qty": 2 }
  router.post('/:userId/cart/items', (req, res) => {
    const { sku, qty = 1 } = req.body || {};
    res.json(carts.add(req.params.userId, sku, qty));
  });

  // 3. Set quantity           { "qty": 3 }   (0 removes the line)
  router.put('/:userId/cart/items/:sku', (req, res) => {
    res.json(carts.setQty(req.params.userId, req.params.sku, (req.body || {}).qty));
  });

  // 2. Remove from cart
  router.delete('/:userId/cart/items/:sku', (req, res) => {
    res.json(carts.remove(req.params.userId, req.params.sku));
  });

  // Empty the cart
  router.delete('/:userId/cart', (req, res) => {
    res.json(carts.empty(req.params.userId));
  });

  // Coupons                   { "code": "WELCOME10" }
  router.put('/:userId/cart/coupon', (req, res) => {
    res.json(carts.applyCoupon(req.params.userId, (req.body || {}).code));
  });

  router.delete('/:userId/cart/coupon', (req, res) => {
    res.json(carts.removeCoupon(req.params.userId));
  });

  // 5. Place an order (checkout)
  router.post('/:userId/orders', (req, res) => {
    const order = orders.checkout(req.params.userId);
    res.status(201).location(`/api/orders/${order.orderNo}`).json(order);
  });

  // Order history, newest first
  router.get('/:userId/orders', (req, res) => {
    res.json(orders.history(req.params.userId));
  });

  return router;
}

module.exports = { userRoutes };
