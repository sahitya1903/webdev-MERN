// Talking to the server: REST for one-off loads, Socket.IO for live events.

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function fetchContacts(me) {
  return getJson(`/api/contacts/${encodeURIComponent(me)}`);
}

// (d) Chat history. Pass `before` to load an older page.
export function fetchHistory(me, peer, { limit = 50, before } = {}) {
  const params = new URLSearchParams({ limit });
  if (before) params.set('before', before);
  return getJson(`/api/history/${encodeURIComponent(me)}/${encodeURIComponent(peer)}?${params}`);
}

// (a) Open the WebSocket. Socket.IO reconnects by itself if the network drops.
export function connect(handle) {
  return window.io({ auth: { handle } });
}
