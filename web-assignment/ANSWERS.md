# Assignment Answers

Each answer is backed by a working project:

| Question | Project | Run it |
|---|---|---|
| 1. WhatsApp-style chat | [chat-app/](chat-app/) (Murmur) | `cd chat-app` → `npm install` → `npm start` → open http://localhost:3000 in two windows |
| 2. E-commerce backend | [ecommerce-backend/](ecommerce-backend/) (Bazaar) | `cd ecommerce-backend` → `npm install` → `npm test` → `npm start` (port 4000) |

---

## Question 1: Building a chat app like WhatsApp

### The big picture

```
  Alice's browser                    Node.js server                     Bob's browser
 ┌───────────────┐                ┌──────────────────┐                ┌───────────────┐
 │ page loads    │── HTTP (REST) ─►  Express          │◄─ HTTP (REST) ─│ page loads    │
 │ once          │                │  contacts, history│                │ once          │
 │               │◄══ WebSocket ══►  Socket.IO        ◄══ WebSocket ══►│               │
 └───────────────┘                │  live events      │                └───────────────┘
                                  │  db.json storage  │
                                  └──────────────────┘
```

Two channels, each used for what it is good at:

* **REST over HTTP** for data you ask for once: the contact list and a conversation's history.
* **A WebSocket (via Socket.IO)** for things that can happen at any moment: new messages,
  typing, people coming online or going offline, and delivery/read receipts.

Server code is split by responsibility:

```
server.js            wires everything together
src/realtime.js      (a) socket events
src/presence.js      (b) who is online
src/db.js            (d) storage, grouped by conversation
src/routes.js        (d) REST endpoints for contacts and history
public/js/main.js    browser state + event handling, (c) notifications
public/js/view.js    (e) DOM rendering
public/js/net.js     fetch + socket helpers
```

### a) Real-time messages

With plain HTTP the browser always has to ask first, so the server has no way to hand Bob a
message the moment Alice sends it. Bob's page would have to keep asking "anything new?"
(polling), which is both slow and wasteful.

A **WebSocket** is a single connection that stays open, and **either side can send data at any
time**. Socket.IO sits on top of it and adds automatic reconnection, acknowledgements and
*rooms* (named groups of connections).

Path of one message:

1. Alice's browser emits `chat:send { to: "bob", body: "Hi" }`.
2. The server validates it (the person exists, it's not empty, not longer than 2000 characters),
   adds an id and a timestamp, and **stores it before doing anything else**.
3. It emits `chat:incoming` to the room `inbox:bob`. Each of Bob's tabs/devices joined that room
   when it connected, so all of them receive the message.
4. It calls Alice's **acknowledgement callback** with the stored message, which tells her page
   the message is safe on the server.

Receipts, as in WhatsApp:

| Icon | State | Meaning |
|---|---|---|
| clock | `pending` | shown immediately on Alice's screen, server hasn't confirmed yet |
| ✓ | `sent` | stored on the server, Bob is offline |
| ✓✓ | `delivered` | reached one of Bob's devices |
| ✓✓ light blue | `read` | Bob opened the conversation (`chat:seen`) |

Code: the `chat:send` handler in [chat-app/src/realtime.js](chat-app/src/realtime.js).

### b) Online / offline status

* [src/presence.js](chat-app/src/presence.js) keeps, for every person, the **set of their open
  socket ids**. A person can have a laptop and a phone open at once, so they count as online while
  that set is not empty.
* First socket opens → broadcast `user:status { online: true }`.
* Last socket closes (tab closed, Wi-Fi lost) → store **`lastSeenAt = now`** and broadcast
  `user:status { online: false, lastSeenAt }`.
* Everyone else's screen switches between "online" and "last seen today at 17:05" straight away.
* **Typing** uses the same idea: `chat:typing { active: true }` on the first key press, `false`
  after 1.5 s without typing. The receiver also clears it after 4 s in case the "stop" event is
  lost.

Socket.IO sends heartbeat pings, so even if a phone drops off the network without closing the
connection cleanly, the server notices within seconds and marks that person offline.

### c) Message notifications

Three levels, depending on how much attention the user is paying:

1. **Inside the app**: an unread **counter** on the contact, the contact jumps to the top of the
   list with a preview of the message, and the browser tab title becomes `(3) Murmur`.
2. **Desktop notification**: if that conversation isn't open, or the tab is in the background,
   the page uses the browser's **Notification API** ("@alice on Murmur"). Clicking it opens the
   chat. Permission is requested once at sign-in.
3. **App fully closed** (production): there's no socket, so the server sends a **push
   notification** through **Firebase Cloud Messaging** (Android and web) or **APNs** (iPhone).
   The device registers a push token at sign-in, the server stores it, and when the recipient has
   no open socket the server sends the push. On the web a **Service Worker** displays it.

Unread counts are calculated on the server (messages that aren't `read` yet), so they are
correct on every device the person signs in from.

### d) Chat history

* **Every message is stored before it is delivered**, so a message to someone who's offline is
  never lost.
* Messages are stored **grouped by conversation** (`"alice|bob"`), which is how a real database
  would partition them. The demo writes this to `chat-app/data/db.json`; in production:

  ```
  messages(id, conversation_id, sender, recipient, body, state, sent_at)
  INDEX ON (conversation_id, sent_at)
  ```

* Opening a chat calls `GET /api/history/alice/bob?limit=50`, which returns the **latest 50
  messages**. Scrolling up would call it again with `&before=<oldest timestamp>` (**pagination**),
  so even a huge conversation opens instantly.
* **Offline delivery**: messages for someone who's offline stay `sent`. When they connect, the
  server marks those messages `delivered` and sends `chat:receipt` to each sender, whose ticks
  update live.
* After a dropped connection comes back, the browser reloads the open conversation and merges it
  with what it already had, so nothing sent during the gap is missed.

### e) Updating the UI without refreshing the page

Murmur is a **single-page application**:

* The HTML is loaded **once**.
* After that, data arrives in only two ways, and neither reloads the page:
  * `fetch()` for the contact list and history
  * socket events: `chat:incoming`, `chat:receipt`, `chat:typing`, `user:status`
* Each event updates the in-memory state and then **redraws only the part of the page it
  affects**: the conversation, the contact list, or the header. New elements are built with
  `document.createElement` and `textContent` (which also makes message text safe from HTML
  injection).
* **Optimistic UI**: your message appears instantly with a clock icon and is swapped for the
  stored version when the server's acknowledgement arrives.
* Frameworks such as React, Vue or Angular follow the same pattern: change the state, and only
  what changed is redrawn.

Code: [chat-app/public/js/](chat-app/public/js/).

### Scaling beyond one server

| Problem | Approach |
|---|---|
| Too many connections for one machine | Several servers behind a load balancer (sticky sessions) |
| Alice and Bob are on different servers | **Redis Pub/Sub** (`@socket.io/redis-adapter`) or Kafka relays events between servers |
| Presence across servers | Keep it in **Redis** with a short expiry that heartbeats refresh |
| Huge message volume | Cassandra / ScyllaDB or a sharded SQL database, partitioned by conversation |
| Security | Sign in with JWT, check the token when the socket connects, HTTPS/WSS, rate limits, end-to-end encryption (Signal protocol, as WhatsApp uses) |
| Photos, voice notes | Upload to object storage (S3) and send only the link in the message |

---

## Question 2: E-commerce backend

**Node.js + Express** REST API, organised in layers so each file has one job:

```
src/
  index.js                 starts the server
  app.js                   builds the Express app, mounts routes and error handling
  config.js                business rules: GST, delivery, item limit, coupons
  data/catalog.js          seed products
  data/repository.js       data access (in memory; one file to swap for a real DB)
  services/pricing.js      pure money maths (4)
  services/CartService.js  add / remove / set quantity / coupons (1, 2, 3)
  services/OrderService.js checkout (5)
  routes/products.js       /api/products
  routes/users.js          /api/users/:userId/cart and /orders
  middleware/errors.js     HttpError + JSON error responses
public/index.html          demo storefront that uses the API
test/                      21 automated tests (pricing, cart, orders)
```

### Data model

```
Product   { sku, title, category, price (paise), stock }
Cart      userId → { items: sku → qty, coupon }      ← no prices stored in the cart
Order     { orderNo, userId, status, placedAt,
            lines[ {sku, title, unitPrice, qty, amount} ], coupon, summary }
```

The cart only remembers **which products and how many**. Prices always come from the catalog,
so a client can't send a fake price and the cart always reflects the current price.

### Endpoints

| Requirement | Method & path | Body |
|---|---|---|
| Browse products | `GET /api/products` (optional `?category=`) | none |
| One product | `GET /api/products/:sku` | none |
| View cart with totals | `GET /api/users/:userId/cart` | none |
| **1. Add to cart** | `POST /api/users/:userId/cart/items` | `{ "sku": "SKU-101", "qty": 2 }` |
| **2. Remove from cart** | `DELETE /api/users/:userId/cart/items/:sku` | none |
| **3. Update quantity** | `PUT /api/users/:userId/cart/items/:sku` | `{ "qty": 3 }` (`0` removes it) |
| Empty cart | `DELETE /api/users/:userId/cart` | none |
| Apply / remove coupon | `PUT` / `DELETE /api/users/:userId/cart/coupon` | `{ "code": "WELCOME10" }` |
| **5. Place order** | `POST /api/users/:userId/orders` | none |
| Order history | `GET /api/users/:userId/orders` | none |
| One order | `GET /api/orders/:orderNo` | none |

Every cart endpoint replies with the whole updated cart, **totals included**, so the client never
has to calculate anything.

### 1. Add products to cart
* `qty` must be a whole number from 1 to 10, and the product must exist (404 otherwise).
* Adding a product that's already there **increases its quantity** instead of creating a
  second line.
* The new quantity can't be more than the stock (409) or more than 10 per product (400).

### 2. Remove products from cart
* Deletes the line; 404 if it wasn't in the cart.

### 3. Update product quantity
* Sets an exact quantity with the same checks. `qty: 0` removes the line, as most shops do.

### 4. Calculate total price
```
subtotal   = Σ unitPrice × qty
discount   = coupon savings (WELCOME10: 10%, max ₹200 · FLAT100: ₹100 off from ₹1,000)
gst        = 18% of (subtotal − discount), rounded to the nearest paisa
delivery   = ₹0 if (subtotal − discount) ≥ ₹999, otherwise ₹49   (₹0 for an empty cart)
grandTotal = subtotal − discount + gst + delivery
```
**All amounts are calculated in paise (whole numbers)** and only converted to rupees in the
response. JavaScript numbers can't hold most decimals exactly (`0.1 + 0.2` gives
`0.30000000000000004`), and integer maths avoids those rounding errors.

Example: 2 × Mug (₹349) + 1 × Journal (₹274.50) → subtotal ₹972.50, GST ₹175.05,
delivery ₹49, **grand total ₹1,196.55**.

If a coupon's minimum is no longer met (the customer removed items), the coupon stays on the
cart but is marked `active: false` and gives no discount.

### 5. Place an order
1. The cart must not be empty (400 `EMPTY_CART`).
2. **Check stock for every line first.** If any product is short, refuse the whole order
   (409 `OUT_OF_STOCK`) and change nothing. It's all-or-nothing, like a database transaction.
3. Reduce stock for each product.
4. Save the order with a **snapshot of titles, prices and totals**, so later catalog changes don't
   alter what the customer paid. Order numbers are readable: `ORD-10001`, `ORD-10002`, …
5. Empty the cart (and its coupon) and return the order with `201 Created`.

In production this runs in a **database transaction** that locks the product rows
(`SELECT … FOR UPDATE`), so two customers can't both buy the last unit. Payment would sit between
steps 2 and 3 (status `PENDING_PAYMENT` → `CONFIRMED`).

### Errors
Services `throw` an `HttpError(status, code, message)`. One middleware turns it into a consistent
JSON body:

```json
{ "error": { "code": "OUT_OF_STOCK", "message": "Only 4 left of 'Mini Succulent Pot'" } }
```

`400` invalid input · `404` not found · `409` not enough stock · `500` unexpected error.
The `code` lets a front end react without parsing the message text.

### Tests
`npm test` runs 21 tests with Node's built-in test runner:
* **pricing.test.js**: the money maths on its own (GST rounding, delivery threshold, coupons)
* **cart.test.js**: every cart operation plus 13 invalid-input cases
* **orders.test.js**: checkout, price snapshot, history, empty cart, and stock running out
  between adding to the cart and checking out

### What production would add
* PostgreSQL or MongoDB instead of memory; carts could live in Redis.
* Authentication (JWT): take the user from the token instead of the URL.
* A payment gateway (Razorpay / Stripe), delivery addresses, order tracking.
* A validation library (Zod / Joi), rate limiting, structured logging.
