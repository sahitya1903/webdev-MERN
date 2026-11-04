// REST endpoints. Things the browser asks for once (contact list, history)
// go over plain HTTP; live events go over the socket (see realtime.js).

const express = require('express');

function apiRouter({ db, profileOf }) {
  const router = express.Router();

  // Everyone except `me`, with presence, unread count and a preview of the last message.
  router.get('/contacts/:me', (req, res) => {
    const { me } = req.params;
    const contacts = db
      .names()
      .filter((name) => name !== me)
      .map((name) => {
        const last = db.latest(me, name);
        return {
          ...profileOf(name),
          unread: db.unreadCount(name, me),
          lastMessage: last && { sender: last.sender, body: last.body, sentAt: last.sentAt },
        };
      });
    res.json(contacts);
  });

  // (d) Conversation history, oldest first.
  // ?limit=50&before=<timestamp> loads older pages when the user scrolls up.
  router.get('/history/:me/:peer', (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const before = Number(req.query.before) || Infinity;
    res.json(db.history(req.params.me, req.params.peer, { limit, before }));
  });

  return router;
}

module.exports = { apiRouter };
