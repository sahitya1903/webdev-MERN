// Murmur: a WhatsApp-style real-time chat (Express + Socket.IO).
//
// Where each part of the question lives:
//   a) Real-time messages  -> src/realtime.js   (WebSocket events, one inbox room per person)
//   b) Online / offline    -> src/presence.js   (open sockets per person, "last seen")
//   c) Notifications       -> public/js/main.js (badge, tab title, desktop notification)
//   d) Chat history        -> src/db.js + src/routes.js (stored per conversation, paged REST API)
//   e) UI without refresh  -> public/js/*      (socket events update only the changed DOM)

const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');

const { ChatDatabase } = require('./src/db');
const { PresenceTracker } = require('./src/presence');
const { apiRouter } = require('./src/routes');
const { attachRealtime } = require('./src/realtime');

const PORT = Number(process.env.PORT) || 3000;

const db = new ChatDatabase(path.join(__dirname, 'data', 'db.json'));
const presence = new PresenceTracker();

// Public info about a person, shared by the REST API and the socket events.
const profileOf = (name) => ({
  name,
  online: presence.isOnline(name),
  lastSeenAt: db.lastSeen(name),
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter({ db, profileOf }));

const server = http.createServer(app);
attachRealtime(new Server(server), { db, presence, profileOf });

server.listen(PORT, () => {
  console.log(`Murmur is running at http://localhost:${PORT}`);
  console.log('Open two browser windows and sign in with two different handles.');
});
