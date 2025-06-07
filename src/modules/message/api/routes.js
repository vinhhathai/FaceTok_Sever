"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    MessageController,
    RoomController
} = require('../controllers');
const checkLogin = require('../../../shared/middlewares/checkLogin');

// Yêu cầu đăng nhập cho tất cả các API
router.use(checkLogin);

// Rooms API
router.get('/rooms', RoomController.getRooms);
router.get('/room/:roomId', RoomController.getRoomById);
router.get('/room/user/:userId', RoomController.getRoomDetails);
router.get('/unread', RoomController.getUnreadCount);

// Messages API
router.post('/send', MessageController.sendMessage);
router.post('/room', MessageController.createRoom);
router.put('/room/:roomId/read', MessageController.markAsRead);
router.get('/room/:roomId/messages', MessageController.getMessages);

module.exports = router; 