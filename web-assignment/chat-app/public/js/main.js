// Murmur browser app: keeps the state and reacts to user actions and socket events.
//
// (e) Updating the UI without refreshing: the page loads once. After that, data
// arrives through fetch() or the open WebSocket, the state below changes, and
// view.js redraws only the affected region.

import { connect, fetchContacts, fetchHistory } from './net.js';
import * as view from './view.js';

const APP_NAME = 'Murmur';
const SESSION_KEY = 'murmur.handle';
const HANDLE_PATTERN = /^[a-zA-Z0-9_]{2,20}$/;
const STATE_ORDER = { pending: 0, sent: 1, delivered: 2, read: 3 };

const session = {
  me: null,
  socket: null,
  contacts: new Map(), // name -> { name, online, lastSeenAt, unread, typing, lastMessage }
  threads: new Map(), // name -> messages (only chats opened in this tab)
  openPeer: null,
  search: '',
  typingExpiry: new Map(),
};

const byId = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Sign in / out
// ---------------------------------------------------------------------------
byId('gate-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const handle = byId('handle').value.trim().replace(/^@/, '');
  if (!HANDLE_PATTERN.test(handle)) {
    view.showGate('Use 2-20 letters, numbers or underscores.');
    return;
  }
  signIn(handle);
});

byId('sign-out').addEventListener('click', () => {
  session.socket?.disconnect();
  storage('remove');
  location.reload();
});

function storage(action, value) {
  try {
    if (action === 'get') return sessionStorage.getItem(SESSION_KEY);
    if (action === 'set') sessionStorage.setItem(SESSION_KEY, value);
    if (action === 'remove') sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage blocked: the user simply signs in again */
  }
  return null;
}

function signIn(handle) {
  session.socket?.disconnect();
  session.me = handle;
  storage('set', handle);

  // (c) Ask once for permission to show desktop notifications.
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  const socket = connect(handle);
  session.socket = socket;

  socket.on('connect', onConnected);
  socket.on('disconnect', () => view.setLink(false));
  socket.on('connect_error', (err) => {
    if (socket.active) return; // temporary network issue: Socket.IO keeps retrying
    storage('remove'); // the server refused this handle
    view.showGate(err.message);
  });

  socket.on('user:status', onUserStatus); // (b)
  socket.on('chat:incoming', onIncoming); // (a) + (c)
  socket.on('chat:receipt', onReceipt); // ticks
  socket.on('chat:typing', onPeerTyping);
}

async function onConnected() {
  view.showShell(session.me);
  view.setLink(true);
  await refreshContacts();
  // After a reconnect, pick up anything that arrived while we were away.
  if (session.openPeer) {
    await syncThread(session.openPeer);
    paintFeed(true);
    markSeen(session.openPeer);
  }
}

// ---------------------------------------------------------------------------
// Loading data
// ---------------------------------------------------------------------------
function contact(name) {
  if (!session.contacts.has(name)) {
    session.contacts.set(name, { name, online: false, lastSeenAt: null, unread: 0, typing: false, lastMessage: null });
  }
  return session.contacts.get(name);
}

async function refreshContacts() {
  try {
    for (const c of await fetchContacts(session.me)) {
      Object.assign(contact(c.name), c);
    }
  } catch {
    view.toast('Could not load your contacts');
  }
  paintContacts();
  paintTitle();
}

// (d) Merge server history with anything that arrived live while it was loading.
async function syncThread(peer) {
  let fetched = [];
  try {
    fetched = await fetchHistory(session.me, peer);
  } catch {
    view.toast('Could not load this conversation');
  }
  const merged = new Map();
  for (const m of [...fetched, ...(session.threads.get(peer) || [])]) {
    const known = merged.get(m.id);
    if (!known || STATE_ORDER[m.state] > STATE_ORDER[known.state]) merged.set(m.id, m);
  }
  session.threads.set(peer, [...merged.values()].sort((a, b) => a.sentAt - b.sentAt));
}

// ---------------------------------------------------------------------------
// Live events from the server
// ---------------------------------------------------------------------------

// (b) Someone came online or went offline.
function onUserStatus(profile) {
  Object.assign(contact(profile.name), profile);
  paintContacts();
  if (session.openPeer === profile.name) paintHead();
}

// (a) A message arrived.
function onIncoming(message) {
  const peer = message.sender === session.me ? message.recipient : message.sender;
  const c = contact(peer);
  c.lastMessage = { sender: message.sender, body: message.body, sentAt: message.sentAt };

  const thread = session.threads.get(peer);
  if (thread && !thread.some((m) => m.id === message.id)) thread.push(message);

  if (message.sender !== session.me) {
    c.typing = false;
    if (session.openPeer === peer && !document.hidden) {
      markSeen(peer);
    } else {
      c.unread = (c.unread || 0) + 1;
      notify(message); // (c)
    }
  }

  if (session.openPeer === peer) {
    paintHead();
    paintFeed();
  }
  paintContacts();
  paintTitle();
}

// Delivered / read receipts.
function onReceipt({ ids, state }) {
  const changed = new Set(ids);
  for (const thread of session.threads.values()) {
    for (const m of thread) {
      if (changed.has(m.id) && STATE_ORDER[state] > STATE_ORDER[m.state]) m.state = state;
    }
  }
  if (session.openPeer) paintFeed();
}

function onPeerTyping({ from, active }) {
  contact(from).typing = active;
  // Fallback: hide "typing…" if the stop event never comes (e.g. their tab crashed).
  clearTimeout(session.typingExpiry.get(from));
  if (active) {
    session.typingExpiry.set(from, setTimeout(() => onPeerTyping({ from, active: false }), 4000));
  }
  paintContacts();
  if (session.openPeer === from) {
    paintHead();
    paintFeed();
  }
}

// ---------------------------------------------------------------------------
// (c) Notifications: unread counts, tab title and desktop notifications
// ---------------------------------------------------------------------------
function notify(message) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const note = new Notification(`@${message.sender} on ${APP_NAME}`, {
      body: message.body.slice(0, 120),
      tag: `murmur-${message.sender}`, // one notification per person, replaced by newer ones
    });
    note.onclick = () => {
      window.focus();
      openThread(message.sender);
      note.close();
    };
  } catch {
    /* some mobile browsers only allow notifications from a service worker */
  }
}

function paintTitle() {
  let unread = 0;
  for (const c of session.contacts.values()) unread += c.unread || 0;
  document.title = unread ? `(${unread}) ${APP_NAME}` : APP_NAME;
}

function markSeen(peer) {
  contact(peer).unread = 0;
  session.socket.emit('chat:seen', { peer });
  paintContacts();
  paintTitle();
}

// Coming back to the tab counts as reading the open chat.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && session.openPeer && contact(session.openPeer).unread) {
    markSeen(session.openPeer);
  }
});

// ---------------------------------------------------------------------------
// Opening chats
// ---------------------------------------------------------------------------
async function openThread(peer) {
  session.openPeer = peer;
  if (!session.threads.has(peer)) session.threads.set(peer, []);
  view.openThreadPane();
  paintHead();
  paintContacts();
  paintFeed(true);

  await syncThread(peer);
  if (session.openPeer !== peer) return; // switched to another chat meanwhile
  paintFeed(true);
  markSeen(peer);
  byId('draft').focus();
}

function closeThread() {
  stopTyping();
  session.openPeer = null;
  view.closeThreadPane();
  paintContacts();
}

byId('thread-back').addEventListener('click', closeThread);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && session.openPeer) closeThread();
});

byId('search').addEventListener('input', (event) => {
  session.search = event.target.value.trim().toLowerCase();
  paintContacts();
});

// ---------------------------------------------------------------------------
// Writing and sending
// ---------------------------------------------------------------------------
const draft = byId('draft');

draft.addEventListener('input', () => {
  // Grow the box with the text, up to the CSS max-height.
  draft.style.height = 'auto';
  draft.style.height = `${draft.scrollHeight}px`;
  byId('send').disabled = !draft.value.trim();
  announceTyping();
});

// Enter sends, Shift+Enter adds a new line.
draft.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    byId('composer').requestSubmit();
  }
});

byId('composer').addEventListener('submit', (event) => {
  event.preventDefault();
  const body = draft.value.trim();
  const to = session.openPeer;
  if (!body || !to) return;

  draft.value = '';
  draft.style.height = 'auto';
  byId('send').disabled = true;
  stopTyping();

  // Optimistic UI: show it straight away with a clock icon,
  // then swap in the stored copy once the server confirms.
  const local = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sender: session.me,
    recipient: to,
    body,
    sentAt: Date.now(),
    state: 'pending',
  };
  session.threads.get(to).push(local);
  contact(to).lastMessage = { sender: session.me, body, sentAt: local.sentAt };
  paintFeed(true);
  paintContacts();

  session.socket.emit('chat:send', { to, body }, (reply) => {
    const thread = session.threads.get(to); // read again: it may have been reloaded
    const index = thread.findIndex((m) => m.id === local.id);
    if (reply?.error) {
      if (index !== -1) thread.splice(index, 1);
      view.toast(reply.error);
    } else if (index !== -1) {
      thread[index] = reply.message;
    }
    if (session.openPeer === to) paintFeed();
  });
});

// Typing indicator: "started" on the first key, "stopped" after 1.5 s of quiet.
let typingIdle = null;
let typingSent = false;

function announceTyping() {
  if (!session.openPeer) return;
  if (!typingSent) {
    typingSent = true;
    session.socket.emit('chat:typing', { to: session.openPeer, active: true });
  }
  clearTimeout(typingIdle);
  typingIdle = setTimeout(stopTyping, 1500);
}

function stopTyping() {
  clearTimeout(typingIdle);
  if (typingSent && session.openPeer) {
    session.socket.emit('chat:typing', { to: session.openPeer, active: false });
  }
  typingSent = false;
}

// ---------------------------------------------------------------------------
// Painting (thin wrappers that hand the current state to view.js)
// ---------------------------------------------------------------------------
function paintContacts() {
  const everyone = [...session.contacts.values()];
  const shown = everyone
    .filter((c) => c.name.toLowerCase().includes(session.search))
    .sort(
      (a, b) =>
        (b.lastMessage?.sentAt || 0) - (a.lastMessage?.sentAt || 0) ||
        Number(b.online) - Number(a.online) ||
        a.name.localeCompare(b.name)
    );
  const emptyText = everyone.length
    ? 'Nobody matches that search.'
    : 'Nobody else is here yet. Open another window and sign in with a different handle.';
  view.renderContacts(shown, { me: session.me, active: session.openPeer, emptyText, onPick: openThread });
}

function paintHead() {
  if (session.openPeer) view.renderThreadHead(contact(session.openPeer));
}

function paintFeed(stickToBottom = false) {
  if (!session.openPeer) return;
  view.renderFeed(session.threads.get(session.openPeer) || [], {
    me: session.me,
    peerTyping: contact(session.openPeer).typing,
    stickToBottom,
  });
}

// Stay signed in when this tab is refreshed.
const remembered = storage('get');
if (remembered) signIn(remembered);
