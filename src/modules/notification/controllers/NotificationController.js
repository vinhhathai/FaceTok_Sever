"use strict";

const NotificationService = require("../services/NotificationService");

class NotificationController {
  constructor() {
    this.notificationService = NotificationService;
  }

  getNotifications = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await this.notificationService.getUserNotifications(userId, page, limit);
    
    if (result.success) {
      // Format response to match client expectations
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
    
    const result = await this.notificationService.getUnreadCount(userId);
    
    if (result.success) {
      // Format response to match client expectations
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
    
    const result = await this.notificationService.markAsRead(notificationId, userId);
    
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
    
    const result = await this.notificationService.markAllAsRead(userId);
    
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
    
    const result = await this.notificationService.deleteNotification(notificationId, userId);
    
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

module.exports = new NotificationController(); 