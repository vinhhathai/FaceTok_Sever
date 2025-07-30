"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { MessageController, RoomController } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");

// Lấy hoặc tạo phòng chat
router.post(
  "/room/get-or-create",
  checkLogin,
  MessageController.getOrCreateRoom
);

// Lấy thông tin phòng 2 user
// router.get("/room/:roomId", checkLogin, RoomController.getRoomById);
// Lấy danh sách tin nhắn phòng chat của 2 user
router.get("/room/:roomId/messages", checkLogin, MessageController.getMessages);

// Lấy danh sách phòng chat của user
router.get("/rooms", checkLogin, RoomController.getRooms);

// Tạo tin nhắn trong phòng đã tồn tại
router.post(
  "/room/:roomId/message",
  checkLogin,
  MessageController.createMessageInRoom
);

//Tạo phòng
// router.post('/room', checkLogin, MessageController.createRoom);

// Gửi tin nhắn
// router.post('/send', checkLogin, MessageController.sendMessage);

// Rooms API
// router.get('/room/user/:userId', RoomController.getRoomDetails);

// router.get('/unread', RoomController.getUnreadCount);

// Messages API
// router.put('/room/:roomId/read', MessageController.markAsRead);

module.exports = router;
