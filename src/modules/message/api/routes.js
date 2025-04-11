"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    MessageController,
    ConversationController
} = require('../controllers');
const  checkLogin  = require('../../../shared/middlewares/checkLogin');


// Conversation Routes
router.get('/conversations', checkLogin, ConversationController.getRecentConversations);
router.get('/conversation/:userId', checkLogin, ConversationController.getConversation);
router.get('/unread/count', checkLogin, ConversationController.getUnreadCount);

// Message Routes
router.get('/messages/:conversationId', checkLogin, MessageController.getMessages);
router.post('/messages', checkLogin, MessageController.sendMessage);
router.put('/read/:messageId', checkLogin, MessageController.markAsRead);

module.exports = router; 