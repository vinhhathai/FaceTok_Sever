const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Notification Schema
 * Stores user notifications for various activities: friend requests, likes, comments
 */
const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['friend_request', 'like', 'comment', 'system'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  message: {
    type: String
  },
  link: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for querying user's notifications sorted by date
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Virtual for formatted notification text based on type
notificationSchema.virtual('text').get(function() {
  switch (this.type) {
    case 'friend_request':
      return 'đã gửi cho bạn lời mời kết bạn';
    case 'like':
      return 'đã thích bài viết của bạn';
    case 'comment':
      return 'đã bình luận về bài viết của bạn';
    case 'system':
      return this.message || 'Thông báo hệ thống';
    default:
      return 'đã tương tác với bạn';
  }
});

// Static method to create a new notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to mark a notification as read
notificationSchema.statics.markAsRead = async function(notificationId) {
  try {
    return await this.findByIdAndUpdate(
      notificationId, 
      { isRead: true },
      { new: true }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  try {
    return await this.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    return await this.countDocuments({ recipient: userId, isRead: false });
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel; 