"use strict";
//----------------------------------------------------------------
const NotificationModel = require('../models/NotificationModel');

class NotificationRepository {
  constructor() {
    this.model = NotificationModel;
  }

  async createNotification({ user, type, content, data }) {
    return this.model.create({ user, type, content, data });
  }

  async getNotificationsByUser(userId, limit = 20, skip = 0) {
    return this.model.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async markAsRead(notificationId, userId) {
    return this.model.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return this.model.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

module.exports = NotificationRepository; 