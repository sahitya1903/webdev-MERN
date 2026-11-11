const { buildApp } = require('./app');

const PORT = Number(process.env.PORT) || 4000;

buildApp().listen(PORT, () => {
  console.log(`Bazaar API listening on http://localhost:${PORT}`);
  console.log(`Storefront: http://localhost:${PORT}   Products: http://localhost:${PORT}/api/products`);
});
