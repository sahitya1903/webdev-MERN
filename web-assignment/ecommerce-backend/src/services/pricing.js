// 4. Calculate total price.
//
// Pure functions: no data access, easy to unit-test.
// Everything is computed in paise (integers). Floating point can't store most
// decimals exactly (0.1 + 0.2 = 0.30000000000000004), so we only convert to
// rupees at the very end, when building the API response.

const { GST_RATE, FREE_DELIVERY_FROM, DELIVERY_FEE, COUPONS } = require('../config');

const toRupees = (paise) => paise / 100;

// Discount a coupon gives on this subtotal (0 if the cart doesn't qualify).
function couponDiscount(code, subtotal) {
  const coupon = code && COUPONS[code];
  if (!coupon || subtotal < coupon.minSubtotal) return 0;
  return Math.min(coupon.discount(subtotal), subtotal);
}

//   subtotal  = Σ unitPrice × qty
//   discount  = coupon savings
//   gst       = 18% of (subtotal − discount), rounded to the nearest paisa
//   delivery  = ₹0 if (subtotal − discount) ≥ ₹999 or the cart is empty, else ₹49
//   grandTotal= subtotal − discount + gst + delivery
function priceLines(lines, couponCode = null) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const discount = couponDiscount(couponCode, subtotal);
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * GST_RATE);
  const delivery = subtotal === 0 || taxable >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  return {
    units: lines.reduce((sum, l) => sum + l.qty, 0),
    subtotal,
    discount,
    gst,
    delivery,
    grandTotal: taxable + gst + delivery,
  };
}

// Shape used by both carts and orders in API responses (rupees).
function present(lines, totals, couponCode) {
  return {
    lines: lines.map((l) => ({
      sku: l.sku,
      title: l.title,
      unitPrice: toRupees(l.unitPrice),
      qty: l.qty,
      amount: toRupees(l.unitPrice * l.qty),
    })),
    coupon: couponCode
      ? {
          code: couponCode,
          description: COUPONS[couponCode].description,
          savings: toRupees(totals.discount),
          active: totals.discount > 0,
        }
      : null,
    summary: {
      units: totals.units,
      subtotal: toRupees(totals.subtotal),
      discount: toRupees(totals.discount),
      gst: toRupees(totals.gst),
      delivery: toRupees(totals.delivery),
      grandTotal: toRupees(totals.grandTotal),
    },
    currency: 'INR',
  };
}

module.exports = { priceLines, couponDiscount, present, toRupees };
