// (a) Real-time layer: Socket.IO keeps one WebSocket open per browser tab.
//
// Events
//   browser -> server   chat:send, chat:typing, chat:seen
//   server  -> browser  chat:incoming, chat:receipt, chat:typing, user:status

const crypto = require('crypto');

const HANDLE_PATTERN = /^[a-zA-Z0-9_]{2,20}$/;
const MAX_BODY_LENGTH = 2000;

// Every tab a person has open joins their inbox room, so one emit reaches all of them.
const inbox = (name) => `inbox:${name}`;

function attachRealtime(io, { db, presence, profileOf }) {
  // Sign-in: the browser sends its handle when it connects.
  // A production app would verify a JWT or session cookie here instead.
  io.use((socket, next) => {
    const handle = socket.handshake.auth?.handle;
    if (typeof handle !== 'string' || !HANDLE_PATTERN.test(handle)) {
      return next(new Error('Handles are 2-20 letters, numbers or underscores'));
    }
    socket.data.handle = handle;
    next();
  });

  io.on('connection', (socket) => {
    const me = socket.data.handle;
    socket.join(inbox(me));
    if (!db.hasPerson(me)) db.addPerson(me);

    // (b) Announce "online" only for the first tab.
    if (presence.attach(me, socket.id)) socket.broadcast.emit('user:status', profileOf(me));

    // Messages that waited while we were offline are now delivered.
    for (const [sender, ids] of db.markDelivered(me)) {
      io.to(inbox(sender)).emit('chat:receipt', { ids, state: 'delivered' });
    }

    // (a) Send a message. `reply` is the Socket.IO acknowledgement callback,
    // which tells the sender the message is safely stored.
    socket.on('chat:send', (payload, reply) => {
      const respond = typeof reply === 'function' ? reply : () => {};
      const to = payload?.to;
      const body = typeof payload?.body === 'string' ? payload.body.trim() : '';

      if (!db.hasPerson(to)) return respond({ error: 'That person does not exist' });
      if (to === me) return respond({ error: "You can't message yourself" });
      if (!body) return respond({ error: 'Write something first' });
      if (body.length > MAX_BODY_LENGTH) return respond({ error: 'Message is too long' });

      const message = {
        id: crypto.randomUUID(),
        sender: me,
        recipient: to,
        body,
        sentAt: Date.now(),
        // sent = stored on server, delivered = on their device, read = they opened it
        state: presence.isOnline(to) ? 'delivered' : 'sent',
      };

      db.saveMessage(message); // (d) store first, then deliver
      io.to(inbox(to)).emit('chat:incoming', message); // (a)+(c) push to recipient
      socket.to(inbox(me)).emit('chat:incoming', message); // my other tabs
      respond({ message });
    });

    socket.on('chat:typing', (payload) => {
      const to = payload?.to;
      if (db.hasPerson(to)) {
        io.to(inbox(to)).emit('chat:typing', { from: me, active: Boolean(payload.active) });
      }
    });

    // I opened the chat with `peer`: their messages to me become "read" (blue ticks).
    socket.on('chat:seen', (payload) => {
      const peer = payload?.peer;
      if (!db.hasPerson(peer)) return;
      const ids = db.markRead(peer, me);
      if (!ids.length) return;
      io.to(inbox(peer)).to(inbox(me)).emit('chat:receipt', { ids, state: 'read' });
    });

    // (b) Last tab closed: offline + remember "last seen".
    socket.on('disconnect', () => {
      if (!presence.detach(me, socket.id)) return;
      db.setLastSeen(me, Date.now());
      io.emit('user:status', profileOf(me));
    });
  });
}

module.exports = { attachRealtime };
