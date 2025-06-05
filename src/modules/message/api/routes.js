"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    MessageController,
    RoomController
} = require('../controllers');
const checkLogin = require('../../../shared/middlewares/checkLogin');

// Create direct chat room between two users
router.post('/room/private/create', checkLogin, MessageController.createRoom);

// Room routes
router.get('/rooms', checkLogin, RoomController.getRooms);
router.get('/room/:userId', checkLogin, RoomController.getRoomDetails);
// // router.get('/unread/count', checkLogin, RoomController.getUnreadCount);

// Message routes
router.post('/messages', checkLogin, MessageController.sendMessage);
// Temporarily disabled mark as read functionality
// router.put('/room/:roomId/read', checkLogin, MessageController.markAsRead);

module.exports = router; 