const { test } = require('node:test');
const assert = require('node:assert/strict');
const { useServer } = require('./helpers');

const api = useServer();

test('checkout takes stock, saves the order and empties the cart', async () => {
  await api.call('POST', '/api/users/asha/cart/items', { sku: 'SKU-106', qty: 2 });
  await api.call('PUT', '/api/users/asha/cart/coupon', { code: 'WELCOME10' });
  const { status, body: order } = await api.call('POST', '/api/users/asha/orders');

  assert.equal(status, 201);
  assert.equal(order.orderNo, 'ORD-10001');
  assert.equal(order.status, 'CONFIRMED');
  // 2 x 1599 = 3198, -200 coupon = 2998, GST 539.64, free delivery
  assert.deepEqual(order.summary, {
    units: 2, subtotal: 3198, discount: 200, gst: 539.64, delivery: 0, grandTotal: 3537.64,
  });
  assert.equal(api.repo.findProduct('SKU-106').stock, 4);

  const cart = await api.call('GET', '/api/users/asha/cart');
  assert.equal(cart.body.lines.length, 0);
  assert.equal(cart.body.coupon, null);

  assert.deepEqual((await api.call('GET', '/api/orders/ORD-10001')).body, order);
  assert.equal((await api.call('GET', '/api/users/asha/orders')).body.length, 1);
});

test('the order keeps the price paid even if the catalog changes later', async () => {
  await api.call('POST', '/api/users/asha/cart/items', { sku: 'SKU-104' });
  const { body: order } = await api.call('POST', '/api/users/asha/orders');
  api.repo.findProduct('SKU-104').price = 1;
  const { body } = await api.call('GET', `/api/orders/${order.orderNo}`);
  assert.equal(body.lines[0].unitPrice, 274.5);
});

test('order history is newest first and per user', async () => {
  for (const sku of ['SKU-101', 'SKU-104']) {
    await api.call('POST', '/api/users/asha/cart/items', { sku });
    await api.call('POST', '/api/users/asha/orders');
  }
  await api.call('POST', '/api/users/ravi/cart/items', { sku: 'SKU-102' });
  await api.call('POST', '/api/users/ravi/orders');

  const { body } = await api.call('GET', '/api/users/asha/orders');
  assert.deepEqual(body.map((o) => o.orderNo), ['ORD-10002', 'ORD-10001']);
});

test('checkout with an empty cart is refused', async () => {
  const { status, body } = await api.call('POST', '/api/users/asha/orders');
  assert.equal(status, 400);
  assert.equal(body.error.code, 'EMPTY_CART');
});

test('if any item ran out, the whole order is refused and nothing changes', async () => {
  await api.call('POST', '/api/users/asha/cart/items', { sku: 'SKU-101' });
  await api.call('POST', '/api/users/asha/cart/items', { sku: 'SKU-105', qty: 4 });
  await api.call('POST', '/api/users/ravi/cart/items', { sku: 'SKU-105', qty: 3 });
  await api.call('POST', '/api/users/ravi/orders'); // ravi buys 3 of the 4 pots first

  const { status, body } = await api.call('POST', '/api/users/asha/orders');
  assert.equal(status, 409);
  assert.equal(body.error.code, 'OUT_OF_STOCK');
  assert.equal(api.repo.findProduct('SKU-101').stock, 40); // mug untouched
  assert.equal(api.repo.findProduct('SKU-105').stock, 1);
  assert.equal((await api.call('GET', '/api/users/asha/cart')).body.lines.length, 2); // cart kept
});

test('unknown order number is a 404', async () => {
  const { status, body } = await api.call('GET', '/api/orders/ORD-1');
  assert.equal(status, 404);
  assert.equal(body.error.code, 'NOT_FOUND');
});
