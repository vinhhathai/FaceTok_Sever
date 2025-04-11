"use strict";
//----------------------------------------------------------------
const NotificationRepository = require("../repositories/NotificationRepository");
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class NotificationStatusService {
  constructor() {
    this.notificationRepository = NotificationRepository;
  }
  
  async markAsRead(notificationId, userId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: 'INVALID_INPUT',
            message: 'Notification ID is required'
          }
        };
      }
      
      if (!userId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: 'INVALID_INPUT',
            message: 'User ID is required'
          }
        };
      }
      
      // Check if notification exists and belongs to user
      const notification = await this.notificationRepository.getNotificationById(notificationId);
      
      if (!notification) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notification not found'
          }
        };
      }
      
      if (notification.userId.toString() !== userId.toString()) {
        return {
          success: false,
          statusCode: 403,
          error: {
            code: errorCode.NOT_PERMISSIONS,
            message: errorMessage.NOT_PERMISSIONS
          }
        };
      }
      
      if (notification.isRead) {
        return {
          success: true,
          statusCode: 200,
          data: notification
        };
      }
      
      const updatedNotification = await this.notificationRepository.markAsRead(notificationId, userId);
      
      return {
        success: true,
        statusCode: 200,
        data: updatedNotification
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: {
          code: errorCode.ERR_INTERNAL_SERVER,
          message: error.message
        }
      };
    }
  }
  
  async markAllAsRead(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: 'INVALID_INPUT',
            message: 'User ID is required'
          }
        };
      }
      
      const count = await this.notificationRepository.markAllAsRead(userId);
      
      return {
        success: true,
        statusCode: 200,
        data: { affectedCount: count }
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: {
          code: errorCode.ERR_INTERNAL_SERVER,
          message: error.message
        }
      };
    }
  }
  
  async deleteNotification(notificationId, userId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: 'INVALID_INPUT',
            message: 'Notification ID is required'
          }
        };
      }
      
      if (!userId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: 'INVALID_INPUT',
            message: 'User ID is required'
          }
        };
      }
      
      // Check if notification exists and belongs to user
      const notification = await this.notificationRepository.getNotificationById(notificationId);
      
      if (!notification) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notification not found'
          }
        };
      }
      
      if (notification.userId.toString() !== userId.toString()) {
        return {
          success: false,
          statusCode: 403,
          error: {
            code: errorCode.NOT_PERMISSIONS,
            message: errorMessage.NOT_PERMISSIONS
          }
        };
      }
      
      const deleted = await this.notificationRepository.deleteNotification(notificationId, userId);
      
      if (!deleted) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete notification'
          }
        };
      }
      
      return {
        success: true,
        statusCode: 200,
        data: { message: 'Notification deleted successfully' }
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: {
          code: errorCode.ERR_INTERNAL_SERVER,
          message: error.message
        }
      };
    }
  }
}

module.exports = new NotificationStatusService(); 