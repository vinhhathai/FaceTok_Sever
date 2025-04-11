"use strict";
//----------------------------------------------------------------
const NotificationRepository = require("../repositories/NotificationRepository");
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class NotificationListService {
  constructor() {
    this.notificationRepository = NotificationRepository;
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
}

module.exports = new NotificationListService(); 