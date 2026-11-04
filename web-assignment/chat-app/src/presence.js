// (b) Online / offline tracking.
//
// One person can have several tabs or devices open, so we keep the set of
// open socket ids per person. They are online while the set is not empty.

class PresenceTracker {
  #connections = new Map(); // name -> Set<socketId>

  // Returns true when this is the person's first open connection (they just came online).
  attach(name, socketId) {
    let sockets = this.#connections.get(name);
    const cameOnline = !sockets;
    if (!sockets) {
      sockets = new Set();
      this.#connections.set(name, sockets);
    }
    sockets.add(socketId);
    return cameOnline;
  }

  // Returns true when the last connection closed (they just went offline).
  detach(name, socketId) {
    const sockets = this.#connections.get(name);
    if (!sockets) return false;
    sockets.delete(socketId);
    if (sockets.size > 0) return false;
    this.#connections.delete(name);
    return true;
  }

  isOnline(name) {
    return this.#connections.has(name);
  }
}

module.exports = { PresenceTracker };
