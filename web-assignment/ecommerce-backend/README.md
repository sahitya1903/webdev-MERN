# Bazaar E-Commerce Backend

## User Handling

This ecommerce backend does **not currently have a user-list endpoint or a separate user database**.

The `userId` is supplied directly in the URL:

```text
/api/users/asha/cart
/api/users/ravi/orders
```

For example:

```bash
curl http://localhost:4000/api/users/asha/cart
curl http://localhost:4000/api/users/asha/orders
```

Users are created implicitly when a cart is accessed. The repository stores carts in memory using a `Map`, but it does not store a separate list of users.

Therefore, this endpoint is not currently available:

```bash
curl http://localhost:4000/api/users
```

## How to Add User Listing

To support listing users, the application would need:

1. A `users` collection in the repository.
2. A user registration route.
3. A `GET /api/users` route.
4. Authentication, such as a JWT or session, in a real application.

## Explanation for Faculty

> This demo does not implement user registration. It uses a user ID in the URL to keep the cart and order examples simple. In production, users would be stored in a database and retrieved through authenticated sessions or JWT tokens.

## Running the Backend

```bash
npm install
npm test
npm start
```

The backend runs at:

```text
http://localhost:4000
```
