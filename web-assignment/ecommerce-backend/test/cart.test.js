const { test } = require('node:test');
const assert = require('node:assert/strict');
const { useServer } = require('./helpers');

const api = useServer();
const CART = '/api/users/asha/cart';

test('lists the catalog with prices in rupees', async () => {
  const { status, body } = await api.call('GET', '/api/products');
  assert.equal(status, 200);
  assert.equal(body.length, 6);
  assert.deepEqual(body[0], {
    sku: 'SKU-101', title: 'Ceramic Coffee Mug', category: 'Kitchen', price: 349, stock: 40, inStock: true,
  });
  const workspace = await api.call('GET', '/api/products?category=Workspace');
  assert.deepEqual(workspace.body.map((p) => p.sku), ['SKU-102', 'SKU-106']);
});

test('adding the same product twice merges into one line', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-101' });
  const { status, body } = await api.call('POST', `${CART}/items`, { sku: 'SKU-101', qty: 2 });
  assert.equal(status, 200);
  assert.equal(body.lines.length, 1);
  assert.deepEqual(body.lines[0], { sku: 'SKU-101', title: 'Ceramic Coffee Mug', unitPrice: 349, qty: 3, amount: 1047 });
});

test('removes a product', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-101' });
  await api.call('POST', `${CART}/items`, { sku: 'SKU-104' });
  const { body } = await api.call('DELETE', `${CART}/items/SKU-101`);
  assert.deepEqual(body.lines.map((l) => l.sku), ['SKU-104']);
});

test('sets an exact quantity, and qty 0 removes the line', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-104' });
  let res = await api.call('PUT', `${CART}/items/SKU-104`, { qty: 5 });
  assert.equal(res.body.lines[0].qty, 5);
  res = await api.call('PUT', `${CART}/items/SKU-104`, { qty: 0 });
  assert.equal(res.body.lines.length, 0);
});

test('cart summary has subtotal, GST, delivery and grand total', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-101', qty: 2 });
  const { body } = await api.call('POST', `${CART}/items`, { sku: 'SKU-104' });
  assert.deepEqual(body.summary, {
    units: 3, subtotal: 972.5, discount: 0, gst: 175.05, delivery: 49, grandTotal: 1196.55,
  });
});

test('coupons: apply, reject when not eligible, remove', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-101' });
  const tooSmall = await api.call('PUT', `${CART}/coupon`, { code: 'flat100' });
  assert.equal(tooSmall.status, 400);
  assert.equal(tooSmall.body.error.code, 'COUPON_NOT_ELIGIBLE');

  await api.call('POST', `${CART}/items`, { sku: 'SKU-103' });
  const applied = await api.call('PUT', `${CART}/coupon`, { code: 'flat100' });
  assert.equal(applied.body.coupon.code, 'FLAT100');
  assert.equal(applied.body.summary.discount, 100);

  const removed = await api.call('DELETE', `${CART}/coupon`);
  assert.equal(removed.body.coupon, null);
  assert.equal(removed.body.summary.discount, 0);
});

test('a coupon stops counting if the cart drops below its minimum', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-103' });
  await api.call('POST', `${CART}/items`, { sku: 'SKU-104' });
  await api.call('PUT', `${CART}/coupon`, { code: 'FLAT100' });
  const { body } = await api.call('DELETE', `${CART}/items/SKU-103`);
  assert.equal(body.coupon.active, false);
  assert.equal(body.summary.discount, 0);
});

test('rejects bad input with a clear error code', async () => {
  const cases = [
    ['POST', `${CART}/items`, { sku: 'SKU-999' }, 404, 'NOT_FOUND'],
    ['POST', `${CART}/items`, { sku: 'SKU-101', qty: 0 }, 400, 'VALIDATION_ERROR'],
    ['POST', `${CART}/items`, { sku: 'SKU-101', qty: -1 }, 400, 'VALIDATION_ERROR'],
    ['POST', `${CART}/items`, { sku: 'SKU-101', qty: 2.5 }, 400, 'VALIDATION_ERROR'],
    ['POST', `${CART}/items`, { sku: 'SKU-101', qty: '2' }, 400, 'VALIDATION_ERROR'],
    ['POST', `${CART}/items`, { sku: 'SKU-101', qty: 11 }, 400, 'VALIDATION_ERROR'],
    ['POST', `${CART}/items`, { sku: 'SKU-105', qty: 5 }, 409, 'OUT_OF_STOCK'], // only 4
    ['PUT', `${CART}/items/SKU-101`, { qty: 2 }, 404, 'NOT_FOUND'],
    ['DELETE', `${CART}/items/SKU-101`, undefined, 404, 'NOT_FOUND'],
    ['PUT', `${CART}/coupon`, { code: 'FREEBIE' }, 400, 'INVALID_COUPON'],
    ['GET', '/api/users/bad%20id/cart', undefined, 400, 'VALIDATION_ERROR'],
    ['POST', `${CART}/items`, '{oops', 400, 'INVALID_JSON'],
    ['GET', '/api/nothing-here', undefined, 404, 'NOT_FOUND'],
  ];
  for (const [method, path, body, status, code] of cases) {
    const res = await api.call(method, path, body);
    assert.equal(res.status, status, `${method} ${path} ${JSON.stringify(body)}`);
    assert.equal(res.body.error.code, code, `${method} ${path}`);
  }
});

test('cannot go over 10 of one product by adding repeatedly', async () => {
  await api.call('POST', `${CART}/items`, { sku: 'SKU-101', qty: 8 });
  const { status, body } = await api.call('POST', `${CART}/items`, { sku: 'SKU-101', qty: 3 });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'LIMIT_REACHED');
});
