"use strict";

const NotificationListService = require("../services/NotificationListService");

class NotificationListController {
  constructor() {
    this.notificationListService = NotificationListService;
  }

  getNotifications = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await this.notificationListService.getUserNotifications(userId, page, limit);
    
    if (result.success) {
      return res.status(result.statusCode).json({
        success: true,
        data: result.data.notifications,
        unreadCount: result.data.unreadCount
      });
    } else {
      return res.status(result.statusCode).json({ 
        timestamp: new Date().toISOString(),
        path: '/notification/list',
        error: result.error 
      });
    }
  }
  
  getUnreadCount = async (req, res) => {
    const userId = req.user.id;
    
    const result = await this.notificationListService.getUnreadCount(userId);
    
    if (result.success) {
      return res.status(result.statusCode).json({
        success: true,
        count: result.data.unreadCount
      });
    } else {
      return res.status(result.statusCode).json({ 
        timestamp: new Date().toISOString(),
        path: '/notification/unread-count',
        error: result.error 
      });
    }
  }
}

module.exports = new NotificationListController(); 