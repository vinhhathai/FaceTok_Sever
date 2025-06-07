"use strict";
//----------------------------------------------------------------
const NotificationRepository = require("../repositories/NotificationRepository");
const { errorCode, errorMessage } = require('../../../shared/common/error');

class NotificationService {
  constructor() {
    this.notificationRepository = NotificationRepository;
  }

  async createNotification(data) {
    try {
      if (!data.userId || !data.type || !data.content) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: 'INVALID_INPUT',
            message: 'User ID, type, and content are required'
          }
        };
      }
      
      const notification = await this.notificationRepository.createNotification(data);
      
      // Gửi thông báo qua Socket.IO
      SocketService.sendNotification(data.userId, notification);
      
      return {
        success: true,
        statusCode: 201,
        data: notification
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

  async getUserNotifications(userId, page = 1, limit = 20) {
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
      
      const skip = (page - 1) * limit;
      const notifications = await this.notificationRepository.getNotifications(userId, limit, skip);
      const unreadCount = await this.notificationRepository.getUnreadCount(userId);
      
      return {
        success: true,
        statusCode: 200,
        data: {
          notifications,
          unreadCount,
          page,
          limit
        }
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: {
          code: errorCode.ERR_GET_DATA_FAILED,
          message: error.message
        }
      };
    }
  }
  
  async getUnreadCount(userId) {
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
      
      const count = await this.notificationRepository.getUnreadCount(userId);
      
      return {
        success: true,
        statusCode: 200,
        data: { unreadCount: count }
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: {
          code: errorCode.ERR_GET_DATA_FAILED,
          message: error.message
        }
      };
    }
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
            code: errorCode.ERR_INTERNAL_SERVER,
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
  
  async createFriendRequestNotification(recipientId, senderId, senderName) {
    try {
      const notificationData = {
        userId: recipientId,
        senderId: senderId,
        content: `${senderName} đã gửi cho bạn một lời mời kết bạn`,
        type: 'friend_request',
        referenceId: senderId,
        onModel: 'users'
      };
      
      return await this.createNotification(notificationData);
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
  
  async createFriendAcceptNotification(recipientId, senderId, senderName) {
    try {
      const notificationData = {
        userId: recipientId,
        senderId: senderId,
        content: `${senderName} đã chấp nhận lời mời kết bạn của bạn`,
        type: 'friend_accept',
        referenceId: senderId,
        onModel: 'users'
      };
      
      return await this.createNotification(notificationData);
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

module.exports = new NotificationService(); 