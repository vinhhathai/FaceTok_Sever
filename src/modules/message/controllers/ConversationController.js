"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');

class ConversationController {
    constructor() {
        this.messageService = MessageService;
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
                    path: '/message/conversations',
                    error: result.error 
                }
        );
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
}

module.exports = new ConversationController(); 