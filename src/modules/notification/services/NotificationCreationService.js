"use strict";
//----------------------------------------------------------------
const NotificationRepository = require("../repositories/NotificationRepository");
const SocketService = require('../../../shared/services/SocketService');
const { errorCode, errorMessage } = require('../../../shared/common/error');

class NotificationCreationService {
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

  async createFriendRequestNotification(recipientId, senderId, senderName) {
    try {
      const notificationData = {
        userId: recipientId,
        senderId: senderId,
        type: 'friend_request',
        content: `${senderName} đã gửi cho bạn lời mời kết bạn`,
        onModel: 'users',
        referenceId: senderId
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating friend request notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationCreationService(); 