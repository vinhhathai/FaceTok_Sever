"use strict";
const NotificationRepository = require("../repositories/NotificationRepository");
const SocketBus = require("../../../shared/socket/SocketBus");

class NotificationService {
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createAndSend({ user, type, content, data }) {
    // 1. Lưu vào DB qua repository
    const notification = await this.notificationRepository.createNotification({
      user,
      type,
      content,
      data,
    });

    // 2. Gửi realtime qua socket
    SocketBus.emitToUser(
      user,
      "notification_received",
      {
        _id: notification._id,
        type,
        content,
        data,
        isRead: false,
        createdAt: notification.createdAt,
      }
    );

    return notification;
  }

  async getNotificationsByUser(userId, limit = 20, skip = 0) {
    return this.notificationRepository.getNotificationsByUser(userId, limit, skip);
  }

  async markAsRead(notificationId, userId) {
    return this.notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}

module.exports = NotificationService;
