"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');

class MessageController {
    constructor() {
        this.messageService = MessageService;
    }

    getConversation = async (req, res) => {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await this.messageService.getConversationMessages(
            currentUserId, 
            otherUserId, 
            page, 
            limit
        );
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/message/conversation/${otherUserId}`,
                    error: result.error 
                }
        );
    }

    sendMessage = async (req, res) => {
        const senderId = req.user.id;
        const { receiverId, text } = req.body;
        
        if (!receiverId || !text) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/message/messages',
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'receiverId and text are required'
                }
            });
        }
        
        const result = await this.messageService.sendMessage(senderId, receiverId, text);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/message/messages',
                    error: result.error 
                }
        );
    }

    markAsRead = async (req, res) => {
        const userId = req.user.id;
        const messageId = req.params.messageId;
        
        const result = await this.messageService.markMessageAsRead(messageId, userId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/message/read/${messageId}`,
                    error: result.error 
                }
        );
    }

    getRecentConversations = async (req, res) => {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await this.messageService.getRecentConversations(userId, limit);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/message/recent',
                    error: result.error 
                }
        );
    }

    getUnreadCount = async (req, res) => {
        const userId = req.user.id;
        
        const result = await this.messageService.getUnreadMessagesCount(userId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/message/unread/count',
                    error: result.error 
                }
        );
    }

    getMessages = async (req, res) => {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await this.messageService.getMessagesByConversationId(
            conversationId,
            userId,
            page,
            limit
        );
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/message/messages/${conversationId}`,
                    error: result.error 
                }
        );
    }
}

module.exports = new MessageController(); 