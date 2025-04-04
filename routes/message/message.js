"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/MessageController/MessageController');
const checkLogin = require('../../middlewares/checkLogin');

// Get all conversations for a user
router.get('/conversations', checkLogin, messageController.getConversations);

// Get messages between two users
router.get('/messages/:conversationId', checkLogin, messageController.getMessages);

// Send a message
router.post('/messages', checkLogin, messageController.sendMessage);

module.exports = router; 