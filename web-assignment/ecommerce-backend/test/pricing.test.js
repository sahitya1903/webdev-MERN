// Unit tests for the money maths (no server needed).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { priceLines, couponDiscount } = require('../src/services/pricing');

const mug = { sku: 'SKU-101', title: 'Mug', unitPrice: 34900, qty: 1 };
const journal = { sku: 'SKU-104', title: 'Journal', unitPrice: 27450, qty: 1 };
const earbuds = { sku: 'SKU-103', title: 'Earbuds', unitPrice: 249900, qty: 1 };

test('empty cart costs nothing (no delivery fee either)', () => {
  assert.deepEqual(priceLines([]), { units: 0, subtotal: 0, discount: 0, gst: 0, delivery: 0, grandTotal: 0 });
});

test('below ₹999 pays ₹49 delivery; GST is rounded to the paisa', () => {
  // 2 x 349 + 274.50 = 972.50, GST 175.05, delivery 49
  const totals = priceLines([{ ...mug, qty: 2 }, journal]);
  assert.deepEqual(totals, { units: 3, subtotal: 97250, discount: 0, gst: 17505, delivery: 4900, grandTotal: 119655 });
});

test('₹999 or more ships free', () => {
  const totals = priceLines([earbuds]);
  assert.equal(totals.delivery, 0);
  assert.equal(totals.grandTotal, 249900 + 44982);
});

test('WELCOME10 gives 10% but never more than ₹200', () => {
  assert.equal(couponDiscount('WELCOME10', 50000), 5000);
  assert.equal(couponDiscount('WELCOME10', 249900), 20000);
});

test('FLAT100 only applies from ₹1,000', () => {
  assert.equal(couponDiscount('FLAT100', 99999), 0);
  assert.equal(couponDiscount('FLAT100', 100000), 10000);
});

test('GST and delivery are worked out on the discounted amount', () => {
  // 2499 - 200 = 2299, GST 413.82, free delivery
  const totals = priceLines([earbuds], 'WELCOME10');
  assert.deepEqual(totals, { units: 1, subtotal: 249900, discount: 20000, gst: 41382, delivery: 0, grandTotal: 271282 });
});
