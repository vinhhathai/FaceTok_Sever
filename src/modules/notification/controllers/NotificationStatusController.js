"use strict";

const NotificationStatusService = require("../services/NotificationStatusService");

class NotificationStatusController {
  constructor() {
    this.notificationStatusService = NotificationStatusService;
  }
  
  markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: '/notification/read',
        error: {
          code: 'INVALID_INPUT',
          message: 'Notification ID is required'
        }
      });
    }
    
    const result = await this.notificationStatusService.markAsRead(notificationId, userId);
    
    if (result.success) {
      return res.status(result.statusCode).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(result.statusCode).json({ 
        timestamp: new Date().toISOString(),
        path: `/notification/read/${notificationId}`,
        error: result.error 
      });
    }
  }
  
  markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    
    const result = await this.notificationStatusService.markAllAsRead(userId);
    
    if (result.success) {
      return res.status(result.statusCode).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(result.statusCode).json({ 
        timestamp: new Date().toISOString(),
        path: '/notification/read-all',
        error: result.error 
      });
    }
  }
  
  deleteNotification = async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: '/notification/delete',
        error: {
          code: 'INVALID_INPUT',
          message: 'Notification ID is required'
        }
      });
    }
    
    const result = await this.notificationStatusService.deleteNotification(notificationId, userId);
    
    if (result.success) {
      return res.status(result.statusCode).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(result.statusCode).json({ 
        timestamp: new Date().toISOString(),
        path: `/notification/delete/${notificationId}`,
        error: result.error 
      });
    }
  }
}

module.exports = new NotificationStatusController(); 