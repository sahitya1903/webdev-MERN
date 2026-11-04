// Everything that touches the page. Each function redraws one region only,
// so a new message or a status change never reloads the page (point e).

const $ = (id) => document.getElementById(id);

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent never runs HTML, so messages are safe
  return node;
}

// ---------- formatting ----------
const DAY = 86_400_000;
const startOfDay = (ts) => new Date(ts).setHours(0, 0, 0, 0);

export const clock = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function dayLabel(ts) {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return new Date(ts).toLocaleDateString([], { weekday: 'long' });
  return new Date(ts).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

function shortStamp(ts) {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
  if (diff === 0) return clock(ts);
  if (diff === 1) return 'Yesterday';
  return new Date(ts).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function presenceText(contact) {
  if (contact.typing) return 'typing…';
  if (contact.online) return 'online';
  if (!contact.lastSeenAt) return 'offline';
  const day = dayLabel(contact.lastSeenAt);
  const when = day === 'Today' || day === 'Yesterday' ? day.toLowerCase() : day;
  return `last seen ${when} at ${clock(contact.lastSeenAt)}`;
}

function hueOf(name) {
  let hash = 7;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return hash;
}

function avatar(name, { online = false, small = false } = {}) {
  const node = make('div', `avatar${small ? ' sm' : ''}`, name[0]);
  node.style.setProperty('--h', hueOf(name));
  if (online) node.append(make('span', 'pip'));
  return node;
}

// ---------- receipt icons (fixed markup, never user text) ----------
const CHECK = 'M1.5 8.5l3 3 7-7';
const RECEIPT_SVG = {
  pending: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.5"/></svg>',
  sent: `<svg viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK}"/></svg>`,
  delivered: `<svg viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK}"/><path d="M9 11.5l8-8"/></svg>`,
};
RECEIPT_SVG.read = RECEIPT_SVG.delivered;

function receipt(state) {
  const node = make('span', `receipt ${state}`);
  node.title = state;
  node.innerHTML = RECEIPT_SVG[state] || ''; // only our own constant SVGs
  return node;
}

// ---------- screens ----------
export function showGate(error = '') {
  $('gate').hidden = false;
  $('shell').hidden = true;
  $('gate-error').textContent = error;
}

export function showShell(me) {
  $('gate').hidden = true;
  $('shell').hidden = false;
  $('my-avatar').replaceChildren(avatar(me, { online: true, small: true }));
  $('my-avatar').title = `Signed in as @${me}`;
}

export function setLink(live) {
  const node = $('link-state');
  node.textContent = live ? 'Connected' : 'Reconnecting…';
  node.classList.toggle('live', live);
}

export function openThreadPane() {
  $('shell').classList.add('in-thread');
  $('placeholder').hidden = true;
  $('thread').hidden = false;
}

export function closeThreadPane() {
  $('shell').classList.remove('in-thread');
  $('thread').hidden = true;
  $('placeholder').hidden = false;
}

// ---------- contact list ----------
function subLine(contact, me) {
  if (contact.typing) return make('span', 'contact-sub typing', 'typing…');
  const last = contact.lastMessage;
  if (last) return make('span', 'contact-sub', `${last.sender === me ? 'You: ' : ''}${last.body}`);
  return make('span', 'contact-sub', presenceText(contact));
}

export function renderContacts(contacts, { me, active, emptyText, onPick }) {
  const frag = document.createDocumentFragment();
  for (const c of contacts) {
    const button = make('button', 'contact');
    button.type = 'button';
    button.classList.toggle('active', c.name === active);
    button.classList.toggle('unread', c.unread > 0);
    button.addEventListener('click', () => onPick(c.name));

    const body = make('span', 'contact-body');
    body.append(make('span', 'contact-name', c.name), subLine(c, me));

    const side = make('span', 'contact-side');
    if (c.lastMessage) side.append(make('time', '', shortStamp(c.lastMessage.sentAt)));
    if (c.unread) side.append(make('span', 'count', c.unread > 99 ? '99+' : String(c.unread)));

    button.append(avatar(c.name, { online: c.online }), body, side);
    const li = make('li');
    li.append(button);
    frag.append(li);
  }
  $('contacts').replaceChildren(frag);
  $('contacts-empty').hidden = contacts.length > 0;
  $('contacts-empty').textContent = emptyText;
}

// ---------- conversation ----------
export function renderThreadHead(contact) {
  $('peer-avatar').replaceChildren(avatar(contact.name, { online: contact.online, small: true }));
  $('peer-name').textContent = contact.name;
  const status = $('peer-status');
  status.textContent = presenceText(contact);
  status.className = contact.typing ? 'typing' : contact.online ? 'live' : '';
}

const GROUP_GAP = 5 * 60 * 1000; // messages closer than this stack together

export function renderFeed(messages, { me, peerTyping = false, stickToBottom = false }) {
  const feed = $('feed');
  const wasNearBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 100;
  const frag = document.createDocumentFragment();

  let currentDay = null;
  let previous = null;
  for (const m of messages) {
    const day = dayLabel(m.sentAt);
    if (day !== currentDay) {
      frag.append(make('div', 'day-chip', day));
      currentDay = day;
      previous = null;
    }
    const mine = m.sender === me;
    const stacked = previous && previous.sender === m.sender && m.sentAt - previous.sentAt < GROUP_GAP;

    const bubble = make('div', `bubble ${mine ? 'out' : 'in'}${stacked ? ' cont' : ''}`);
    const foot = make('span', 'bubble-foot', clock(m.sentAt));
    if (mine) foot.append(receipt(m.state));
    bubble.append(make('p', 'bubble-text', m.body), foot);
    frag.append(bubble);
    previous = m;
  }

  if (peerTyping) {
    const bubble = make('div', 'bubble in');
    const dots = make('span', 'typing-dots');
    dots.append(make('i'), make('i'), make('i'));
    bubble.append(dots);
    frag.append(bubble);
  } else if (!messages.length) {
    frag.append(make('p', 'feed-empty', 'No messages yet. Say hello!'));
  }

  feed.replaceChildren(frag);
  if (stickToBottom || wasNearBottom) feed.scrollTop = feed.scrollHeight;
}

// ---------- toast ----------
let toastTimer = null;
export function toast(text) {
  const node = $('toast');
  node.textContent = text;
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.hidden = true; }, 3200);
}
