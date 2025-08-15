"use strict";
//----------------------------------------------------------------
let ioInstance = null;

/**
 * Simple Socket bus to allow controllers (HTTP) to emit realtime events
 * without direct access to the socket in request scope.
 */
const SocketBus = {
  /**
   * Initialize with Socket.IO server instance
   * @param {import('socket.io').Server} io
   */
  setIo(io) {
    ioInstance = io;
  },

  /**
   * Emit to a room in message namespace
   * @param {string} roomId
   * @param {string} event
   * @param {object} payload
   */
  emitToRoom(roomId, event, payload) {
    if (!ioInstance || !roomId) return;
    try {
      ioInstance.of("/message").to(`room:${roomId}`).emit(event, payload);
    } catch (e) {
      // silenced
    }
  },

  /**
   * Emit to a specific user (all devices) in message namespace
   * @param {string} userId
   * @param {string} event
   * @param {object} payload
   */
  emitToUser(userId, event, payload) {
    if (!ioInstance || !userId) return;
    try {
      ioInstance.of("/message").to(`user:${userId}`).emit(event, payload);
    } catch (e) {
      // silenced
    }
  }
};

module.exports = SocketBus;


