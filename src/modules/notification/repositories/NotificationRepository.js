"use strict";
//----------------------------------------------------------------
const NotificationModel = require('../models/NotificationModel');

class NotificationRepository {
  constructor() {
    this.model = NotificationModel;
  }

  async createNotification(data) {
    const { userId, senderId, content, type, referenceId, onModel } = data;
    
    const newNotification = new this.model({
      userId,
      senderId,
      content,
      type,
      referenceId,
      onModel,
      isRead: false
    });
    
    const savedNotification = await newNotification.save();
    return savedNotification;
  }

  async getNotifications(userId, limit = 20, skip = 0) {
    const notifications = await this.model.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'fullName profilePicture')
      .lean()
      .exec();
      
    // Format notifications to match client expectations
    return notifications.map(notification => {
      // Generate link based on notification type
      let link = '/';
      if (notification.type === 'friend_request') {
        link = '/friends';
      } else if (notification.type === 'post_like' || notification.type === 'post_comment') {
        link = `/post/${notification.referenceId}`;
      }
      
      // Get notification text based on type
      const text = this.getNotificationText(notification);
      
      // Return formatted notification
      return {
        id: notification._id,
        user: notification.senderId,
        text,
        timestamp: notification.createdAt,
        isRead: notification.isRead,
        type: notification.type,
        link
      };
    });
  }

  async getUnreadCount(userId) {
    return this.model.countDocuments({
      userId,
      isRead: false
    });
  }

  async markAsRead(notificationId, userId) {
    return this.model.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    const result = await this.model.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    
    return result.modifiedCount;
  }

  async deleteNotification(notificationId, userId) {
    const result = await this.model.findOneAndDelete({
      _id: notificationId,
      userId
    });
    
    return result !== null;
  }

  async getNotificationById(notificationId) {
    return this.model.findById(notificationId);
  }

  // Helper method to get notification text based on type
  getNotificationText(notification) {
    switch (notification.type) {
      case 'friend_request':
        return 'đã gửi cho bạn lời mời kết bạn';
      case 'friend_accept':
        return 'đã chấp nhận lời mời kết bạn của bạn';
      case 'post_like':
        return 'đã thích bài viết của bạn';
      case 'post_comment':
        return 'đã bình luận về bài viết của bạn';
      case 'system':
        return notification.content || 'Thông báo hệ thống';
      default:
        return 'đã tương tác với bạn';
    }
  }
}

module.exports = new NotificationRepository(); 