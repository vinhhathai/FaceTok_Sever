const NotificationModel = require('../../models/NotificationModel');
const UserModel = require('../../models/UserModel');
const mongoose = require('mongoose');

/**
 * Get all notifications for the current user
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all notifications for this user, sorted by creation date
    const notifications = await NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'fullName profilePicture')
      .populate('post', 'content')
      .lean();
    
    // Add text property from virtual
    const notificationsWithText = notifications.map(notification => {
      // Generate link based on notification type
      let link = '/';
      if (notification.type === 'friend_request') {
        link = '/friends';
      } else if (notification.type === 'like' || notification.type === 'comment') {
        link = `/post/${notification.post?._id}`;
      } else if (notification.link) {
        link = notification.link;
      }
      
      // Build formatted notification with required fields for frontend
      return {
        id: notification._id,
        user: notification.sender,
        text: getNotificationText(notification),
        timestamp: notification.createdAt,
        isRead: notification.isRead,
        type: notification.type,
        link
      };
    });
    
    return res.status(200).json({
      success: true,
      data: notificationsWithText,
      unreadCount: notificationsWithText.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thông báo. Vui lòng thử lại sau.',
      error: error.message
    });
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'ID thông báo không hợp lệ'
      });
    }
    
    // First verify the notification belongs to this user
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Thông báo không tồn tại'
      });
    }
    
    // Mark as read
    const updatedNotification = await NotificationModel.markAsRead(notificationId);
    
    return res.status(200).json({
      success: true,
      data: updatedNotification,
      message: 'Đánh dấu đã đọc thành công'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể đánh dấu đã đọc. Vui lòng thử lại sau.',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read for the current user
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Mark all as read
    const result = await NotificationModel.markAllAsRead(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại sau.',
      error: error.message
    });
  }
};

/**
 * Get unread notification count for current user
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await NotificationModel.getUnreadCount(userId);
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy số thông báo chưa đọc.',
      error: error.message
    });
  }
};

/**
 * Create a notification - internal use only
 * For creating like and comment notifications from other controllers
 */
const createNotification = async (data) => {
  try {
    // Don't create notification if sender is recipient
    if (data.sender.toString() === data.recipient.toString()) {
      return null;
    }
    
    const notification = await NotificationModel.createNotification(data);
    
    // Format notification for the client
    const formattedNotification = await formatNotification(notification);
    
    // If socket.io is available, send real-time notification
    try {
      // Import dynamically to avoid circular dependency
      const { getSocketIO, onlineUsers } = require('../../socket');
      const io = getSocketIO();
      if (io) {
        const recipientSocketId = onlineUsers.get(data.recipient.toString());
        console.log(`[Notification] Sending notification to user ${data.recipient}`, { 
          recipientOnline: !!recipientSocketId,
          socketId: recipientSocketId,
          notification: formattedNotification 
        });
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newNotification', formattedNotification);
          console.log(`[Notification] Notification sent successfully to socket ${recipientSocketId}`);
        } else {
          console.log(`[Notification] Recipient ${data.recipient} is offline, notification not sent`);
        }
      } else {
        console.log(`[Notification] Socket.io instance not available`);
      }
    } catch (error) {
      console.log('Socket notification not sent (non-critical):', error.message);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Format a notification for client consumption
 */
const formatNotification = async (notification) => {
  // Populate the sender
  const populatedNotification = await NotificationModel.findById(notification._id)
    .populate('sender', 'fullName profilePicture')
    .lean();
  
  // Generate link based on notification type
  let link = '/';
  if (populatedNotification.type === 'friend_request') {
    link = '/friends';
  } else if (populatedNotification.type === 'like' || populatedNotification.type === 'comment') {
    link = `/post/${populatedNotification.post}`;
  } else if (populatedNotification.link) {
    link = populatedNotification.link;
  }
  
  // Return formatted notification
  return {
    id: populatedNotification._id,
    user: populatedNotification.sender,
    text: getNotificationText(populatedNotification),
    timestamp: populatedNotification.createdAt,
    isRead: populatedNotification.isRead,
    type: populatedNotification.type,
    link
  };
};

/**
 * Helper function to get text based on notification type
 */
const getNotificationText = (notification) => {
  switch (notification.type) {
    case 'friend_request':
      return 'đã gửi cho bạn lời mời kết bạn';
    case 'like':
      return 'đã thích bài viết của bạn';
    case 'comment':
      return 'đã bình luận về bài viết của bạn';
    case 'system':
      return notification.message || 'Thông báo hệ thống';
    default:
      return 'đã tương tác với bạn';
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification
}; 