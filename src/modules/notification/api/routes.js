"use strict";

const express = require("express");
const router = express.Router();
const {
    NotificationListController,
    NotificationStatusController,
    NotificationCreationController
} = require("../controllers");
const NotificationController = require("../controllers");
const  checkLogin  = require('../../../shared/middlewares/checkLogin');


// // Lấy tất cả thông báo của người dùng
// router.get("/list", checkLogin, NotificationListController.getNotifications);

// // Lấy số lượng thông báo chưa đọc
// router.get("/unread-count", checkLogin, NotificationListController.getUnreadCount);

// // Đánh dấu một thông báo là đã đọc
// router.put("/read/:notificationId", checkLogin, NotificationStatusController.markAsRead);

// // Đánh dấu tất cả thông báo là đã đọc
// router.put("/read-all", checkLogin, NotificationStatusController.markAllAsRead);

// // Xóa một thông báo
// router.delete("/delete/:notificationId", checkLogin, NotificationStatusController.deleteNotification);

// // Tạo một thông báo mới (chỉ dành cho admin hoặc system)
// router.post("/create", checkLogin, NotificationCreationController.createNotification);

// Lấy danh sách notification của user hiện tại
router.get("/notifications", checkLogin, NotificationController.getNotifications);

// Đánh dấu 1 notification đã đọc
router.put("/:notificationId/read", checkLogin, NotificationController.markAsRead);

// Đánh dấu tất cả notification đã đọc
router.put("/read-all", checkLogin, NotificationController.markAllAsRead);

module.exports = router; 