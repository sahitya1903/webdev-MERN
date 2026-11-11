// Cart rules: add, remove, change quantity, coupons.
//
// A cart stores only sku -> qty. Prices are always read from the catalog,
// so a client can never send its own price and the cart is never out of date.

const { MAX_QTY_PER_ITEM, COUPONS } = require('../config');
const { badRequest, notFound, conflict } = require('../middleware/errors');
const { priceLines, couponDiscount, present, toRupees } = require('./pricing');

function assertQty(qty) {
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
    throw badRequest(`qty must be a whole number from 1 to ${MAX_QTY_PER_ITEM}`);
  }
}

class CartService {
  constructor(repo) {
    this.repo = repo;
  }

  product(sku) {
    const product = this.repo.findProduct(sku);
    if (!product) throw notFound(`No product with sku '${sku}'`);
    return product;
  }

  assertInStock(product, qty) {
    if (qty > product.stock) {
      throw conflict(`Only ${product.stock} left of '${product.title}'`);
    }
  }

  // 1. Add a product. Adding one that's already in the cart increases its qty.
  add(userId, sku, qty = 1) {
    assertQty(qty);
    const product = this.product(sku);
    const { items } = this.repo.cartOf(userId);
    const next = (items.get(sku) || 0) + qty;
    if (next > MAX_QTY_PER_ITEM) {
      throw badRequest(`You can have at most ${MAX_QTY_PER_ITEM} of one product`, 'LIMIT_REACHED');
    }
    this.assertInStock(product, next);
    items.set(sku, next);
    return this.view(userId);
  }

  // 2. Remove a product.
  remove(userId, sku) {
    if (!this.repo.cartOf(userId).items.delete(sku)) {
      throw notFound(`'${sku}' is not in the cart`);
    }
    return this.view(userId);
  }

  // 3. Set an exact quantity. 0 removes the line.
  setQty(userId, sku, qty) {
    if (qty === 0) return this.remove(userId, sku);
    assertQty(qty);
    const { items } = this.repo.cartOf(userId);
    if (!items.has(sku)) throw notFound(`'${sku}' is not in the cart`);
    this.assertInStock(this.product(sku), qty);
    items.set(sku, qty);
    return this.view(userId);
  }

  empty(userId) {
    const cart = this.repo.cartOf(userId);
    cart.items.clear();
    cart.coupon = null;
    return this.view(userId);
  }

  applyCoupon(userId, rawCode) {
    const code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';
    const coupon = COUPONS[code];
    if (!coupon) throw badRequest(`'${rawCode}' is not a valid coupon`, 'INVALID_COUPON');

    const subtotal = this.totals(userId).subtotal;
    if (couponDiscount(code, subtotal) === 0) {
      const needed = toRupees(coupon.minSubtotal);
      throw badRequest(`${code} needs a cart of at least ₹${needed}`, 'COUPON_NOT_ELIGIBLE');
    }
    this.repo.cartOf(userId).coupon = code;
    return this.view(userId);
  }

  removeCoupon(userId) {
    this.repo.cartOf(userId).coupon = null;
    return this.view(userId);
  }

  // Cart lines in paise (used by checkout too).
  lines(userId) {
    return [...this.repo.cartOf(userId).items].map(([sku, qty]) => {
      const product = this.product(sku);
      return { sku, title: product.title, unitPrice: product.price, qty };
    });
  }

  totals(userId) {
    return priceLines(this.lines(userId), this.repo.cartOf(userId).coupon);
  }

  // 4. Cart with totals, in rupees, ready for the API response.
  view(userId) {
    const lines = this.lines(userId);
    const { coupon } = this.repo.cartOf(userId);
    return { userId, ...present(lines, priceLines(lines, coupon), coupon) };
  }
}

module.exports = { CartService };
