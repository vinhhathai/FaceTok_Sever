"use strict";

const NotificationCreationService = require("../services/NotificationCreationService");

class NotificationCreationController {
  constructor() {
    this.notificationCreationService = NotificationCreationService;
  }

  createNotification = async (req, res) => {
    const { userId, type, content, referenceId, onModel, senderId } = req.body;
    
    if (!userId || !type || !content) {
      return res.status(400).json({
        success: false,
        timestamp: new Date().toISOString(),
        path: '/notification/create',
        error: {
          code: 'INVALID_INPUT',
          message: 'User ID, type, and content are required'
        }
      });
    }
    
    const notificationData = {
      userId,
      type,
      content,
      referenceId,
      onModel,
      senderId: senderId || req.user.id
    };
    
    const result = await this.notificationCreationService.createNotification(notificationData);
    
    if (result.success) {
      return res.status(result.statusCode).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(result.statusCode).json({ 
        timestamp: new Date().toISOString(),
        path: '/notification/create',
        error: result.error 
      });
    }
  }
}

module.exports = new NotificationCreationController(); 