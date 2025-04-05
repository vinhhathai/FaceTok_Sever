const express = require('express');
const  checkLogin  = require('../../middlewares/checkLogin');
const NotificationController = require('../../controllers/NotificationController/NotificationController');

const router = express.Router();


// Get all notifications for the current user
router.get('/list', checkLogin, NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', checkLogin,NotificationController.getUnreadCount);

// Mark a specific notification as read
router.put('/read/:notificationId', checkLogin,NotificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', checkLogin,NotificationController.markAllAsRead);

module.exports = router; 