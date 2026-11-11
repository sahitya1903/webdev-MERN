// 5. Place an order (checkout).
//
//   1) the cart must have at least one item
//   2) check stock for EVERY line first; if one fails, nothing changes (all-or-nothing)
//   3) take the stock, save the order with a snapshot of names and prices
//   4) empty the cart
//
// This method has no `await`, so Node runs it start to finish without another
// request getting in between: two shoppers can't both buy the last unit.
// With a real database, steps 2-4 go inside one transaction with the product
// rows locked (SELECT ... FOR UPDATE).

const { badRequest, notFound, conflict } = require('../middleware/errors');
const { priceLines, present } = require('./pricing');

class OrderService {
  constructor(repo, carts) {
    this.repo = repo;
    this.carts = carts;
  }

  checkout(userId) {
    const lines = this.carts.lines(userId);
    if (lines.length === 0) throw badRequest('Your cart is empty', 'EMPTY_CART');

    const shortages = lines
      .map((l) => ({ line: l, product: this.repo.findProduct(l.sku) }))
      .filter(({ line, product }) => line.qty > product.stock)
      .map(({ line, product }) => `'${product.title}' (${product.stock} left, ${line.qty} wanted)`);
    if (shortages.length) {
      throw conflict(`Not enough stock for ${shortages.join(', ')}`);
    }

    for (const line of lines) this.repo.findProduct(line.sku).stock -= line.qty;

    const { coupon } = this.repo.cartOf(userId);
    const order = {
      orderNo: this.repo.nextOrderNo(),
      userId,
      status: 'CONFIRMED',
      placedAt: new Date().toISOString(),
      ...present(lines, priceLines(lines, coupon), coupon), // frozen copy of what was paid
    };

    this.repo.saveOrder(order);
    this.carts.empty(userId);
    return order;
  }

  find(orderNo) {
    const order = this.repo.findOrder(orderNo);
    if (!order) throw notFound(`No order '${orderNo}'`);
    return order;
  }

  history(userId) {
    return this.repo.ordersOf(userId);
  }
}

module.exports = { OrderService };
