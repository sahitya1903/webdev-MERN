# Web Assignment: Murmur and Bazaar

This repository contains two independent Node.js applications:

| Project | Description | Port |
|---|---|---:|
| [chat-app/](chat-app/) | **Murmur**, a real-time chat application | 3000 |
| [ecommerce-backend/](ecommerce-backend/) | **Bazaar**, an e-commerce REST API and demo storefront | 4000 |

You need **Node.js 18 or newer**. Install dependencies separately inside each project.

## 1. Murmur Chat

### Start

```bash
cd chat-app
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Sign in as `alice`, open a
second browser window, and sign in as `bob`.

### Features to demonstrate

- Instant messages without refreshing the page
- Online, offline, and last-seen status
- Typing indicators
- Sent, delivered, and read receipts
- Unread counts, tab-title counts, and desktop notifications
- Contact search
- `Enter` to send and `Shift+Enter` for a new line
- Persistent conversation history in `chat-app/data/db.json`

### How it works

- Express serves the frontend and REST endpoints.
- Socket.IO maintains a live connection for each browser tab.
- REST loads contacts and conversation history.
- Socket.IO sends messages, typing events, presence updates, and receipts.
- Messages are stored by conversation in `data/db.json`.
- A user is online while at least one of their connections is active.

Main implementation files:

- [server.js](chat-app/server.js): application startup
- [src/realtime.js](chat-app/src/realtime.js): Socket.IO events
- [src/presence.js](chat-app/src/presence.js): online/offline tracking
- [src/db.js](chat-app/src/db.js): JSON-backed message storage
- [src/routes.js](chat-app/src/routes.js): REST endpoints

## 2. Bazaar E-Commerce Backend

### Start and test

```bash
cd ecommerce-backend
npm install
npm test
npm start
```

Open the storefront at [http://localhost:4000](http://localhost:4000).

### API examples

List products:

```bash
curl http://localhost:4000/api/products
```

Add products to Asha's cart:

```bash
curl -X POST http://localhost:4000/api/users/asha/cart/items ^
  -H "Content-Type: application/json" ^
  -d "{\"sku\":\"SKU-101\",\"qty\":2}"
```

View the cart:

```bash
curl http://localhost:4000/api/users/asha/cart
```

Apply a coupon:

```bash
curl -X PUT http://localhost:4000/api/users/asha/cart/coupon ^
  -H "Content-Type: application/json" ^
  -d "{\"code\":\"WELCOME10\"}"
```

Checkout and view order history:

```bash
curl -X POST http://localhost:4000/api/users/asha/orders
curl http://localhost:4000/api/users/asha/orders
```

Postman and Thunder Client can use the same URLs.

### How it works

1. Product routes read the catalog and return product information.
2. Cart routes validate SKUs, quantities, and stock.
3. `CartService` stores SKU and quantity, then calculates totals.
4. Pricing calculates subtotal, coupon discount, 18% GST, delivery, and grand total.
5. Checkout verifies all stock before changing anything.
6. The order is saved with a snapshot of the names and prices paid.
7. Stock is reduced and the cart is emptied after successful checkout.

Money is calculated internally in paise to avoid floating-point errors.

Main implementation files:

- [src/app.js](ecommerce-backend/src/app.js): Express application
- [src/routes/products.js](ecommerce-backend/src/routes/products.js): product API
- [src/routes/users.js](ecommerce-backend/src/routes/users.js): cart and order API
- [src/services/CartService.js](ecommerce-backend/src/services/CartService.js): cart rules
- [src/services/OrderService.js](ecommerce-backend/src/services/OrderService.js): checkout rules
- [src/services/pricing.js](ecommerce-backend/src/services/pricing.js): price calculations
- [src/data/repository.js](ecommerce-backend/src/data/repository.js): in-memory data layer

### User handling limitation

Bazaar does not currently have registration, authentication, or a
`GET /api/users` endpoint. The `userId` is supplied in the URL, for example:

```text
/api/users/asha/cart
/api/users/ravi/orders
```

Accessing a cart creates that user's cart in memory. A production system would
store users in a database and identify them using a session or JWT.

## Faculty Presentation Order

1. Introduce the two applications and their ports.
2. Demonstrate Murmur with two browser windows.
3. Explain REST for initial data and Socket.IO for live events.
4. Demonstrate Bazaar by listing products, adding to a cart, applying a coupon,
   and checking out.
5. Explain the separation between routes, services, pricing, and repository.
6. Run `npm test` in `ecommerce-backend` and explain the validation and
   all-or-nothing stock checks.
7. Mention production improvements: authentication, a persistent database,
   payment integration, and database transactions.

For written answers, see [ANSWERS.md](ANSWERS.md).
