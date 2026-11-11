// Business rules in one place. All money is in paise (₹1 = 100 paise).

module.exports = {
  GST_RATE: 0.18, // 18% GST
  FREE_DELIVERY_FROM: 99900, // free delivery when the (discounted) subtotal is ₹999 or more
  DELIVERY_FEE: 4900, // otherwise ₹49
  MAX_QTY_PER_ITEM: 10, // per product, per cart

  COUPONS: {
    WELCOME10: {
      description: '10% off, up to ₹200',
      minSubtotal: 0,
      discount: (subtotal) => Math.min(Math.round(subtotal * 0.1), 20000),
    },
    FLAT100: {
      description: '₹100 off orders of ₹1,000 or more',
      minSubtotal: 100000,
      discount: () => 10000,
    },
  },
};
