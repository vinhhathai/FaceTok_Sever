"use strict";
const NotificationService = require("../services/NotificationService");

class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const skip = parseInt(req.query.skip) || 0;
      const notifications = await this.notificationService.getNotificationsByUser(userId, limit, skip);
      return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  markAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.notificationId;
      const updated = await this.notificationService.markAsRead(notificationId, userId);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  markAllAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      await this.notificationService.markAllAsRead(userId);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = new NotificationController();
