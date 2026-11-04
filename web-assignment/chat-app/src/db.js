// (d) Chat history storage.
//
// Messages are grouped by conversation ("alice|bob"), the same way a real
// database would partition them by conversation_id. The whole thing is kept
// in memory and written to a JSON file so the demo needs no database server.

const fs = require('fs');
const path = require('path');

const conversationKey = (a, b) => [a, b].sort().join('|');

class ChatDatabase {
  constructor(file) {
    this.file = file;
    this.people = new Map(); // name -> { joinedAt, lastSeenAt }
    this.conversations = new Map(); // "a|b" -> [message, ...] (oldest first)
    this.flushTimer = null;
    this.load();
  }

  load() {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      return; // first run: start empty
    }
    for (const [name, info] of Object.entries(raw.people || {})) this.people.set(name, info);
    for (const [key, list] of Object.entries(raw.conversations || {})) this.conversations.set(key, list);
  }

  // Group writes that happen close together into one disk write.
  persist() {
    clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      const snapshot = {
        people: Object.fromEntries(this.people),
        conversations: Object.fromEntries(this.conversations),
      };
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(this.file, JSON.stringify(snapshot, null, 2));
    }, 250);
  }

  // ----- people -----
  hasPerson(name) {
    return typeof name === 'string' && this.people.has(name);
  }

  addPerson(name) {
    this.people.set(name, { joinedAt: Date.now(), lastSeenAt: null });
    this.persist();
  }

  names() {
    return [...this.people.keys()];
  }

  lastSeen(name) {
    return this.people.get(name)?.lastSeenAt ?? null;
  }

  setLastSeen(name, when) {
    const person = this.people.get(name);
    if (!person) return;
    person.lastSeenAt = when;
    this.persist();
  }

  // ----- messages -----
  saveMessage(message) {
    const key = conversationKey(message.sender, message.recipient);
    if (!this.conversations.has(key)) this.conversations.set(key, []);
    this.conversations.get(key).push(message);
    this.persist();
  }

  // Latest `limit` messages sent before `before`, oldest first (for paging back in time).
  history(a, b, { limit = 50, before = Infinity } = {}) {
    const all = this.conversations.get(conversationKey(a, b)) || [];
    return all.filter((m) => m.sentAt < before).slice(-limit);
  }

  latest(a, b) {
    const all = this.conversations.get(conversationKey(a, b));
    return all?.length ? all[all.length - 1] : null;
  }

  unreadCount(sender, recipient) {
    const all = this.conversations.get(conversationKey(sender, recipient)) || [];
    return all.filter((m) => m.sender === sender && m.state !== 'read').length;
  }

  // Recipient opened the chat: everything `sender` sent them is now read.
  markRead(sender, recipient) {
    const ids = [];
    for (const m of this.conversations.get(conversationKey(sender, recipient)) || []) {
      if (m.sender === sender && m.state !== 'read') {
        m.state = 'read';
        ids.push(m.id);
      }
    }
    if (ids.length) this.persist();
    return ids;
  }

  // Recipient just came online: their waiting messages are now delivered.
  // Returns Map(sender -> ids) so each sender can be told.
  markDelivered(recipient) {
    const bySender = new Map();
    for (const list of this.conversations.values()) {
      for (const m of list) {
        if (m.recipient !== recipient || m.state !== 'sent') continue;
        m.state = 'delivered';
        if (!bySender.has(m.sender)) bySender.set(m.sender, []);
        bySender.get(m.sender).push(m.id);
      }
    }
    if (bySender.size) this.persist();
    return bySender;
  }
}

module.exports = { ChatDatabase };
