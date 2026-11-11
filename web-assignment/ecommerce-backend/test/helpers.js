// Starts a fresh app (fresh in-memory data) on a random port for each test.

const { beforeEach, afterEach } = require('node:test');
const { buildApp } = require('../src/app');
const { Repository } = require('../src/data/repository');

function useServer() {
  const ctx = { repo: null, call: null };
  let server;

  beforeEach(async () => {
    ctx.repo = new Repository();
    server = buildApp({ repo: ctx.repo }).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://localhost:${server.address().port}`;

    ctx.call = async (method, path, body) => {
      const res = await fetch(base + path, {
        method,
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
      });
      return { status: res.status, body: await res.json() };
    };
  });

  afterEach(() => new Promise((resolve) => server.close(resolve)));
  return ctx;
}

module.exports = { useServer };
