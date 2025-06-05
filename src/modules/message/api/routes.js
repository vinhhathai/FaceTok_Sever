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
router.get('/room/id/:roomId', checkLogin, RoomController.getRoomById);
router.get('/room/:userId', checkLogin, RoomController.getRoomDetails);

// Message routes
router.post('/messages', checkLogin, MessageController.sendMessage);

module.exports = router; 