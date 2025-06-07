"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');
const { ConversationDto } = require('../dtos');

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
                ? ConversationDto.success(result.data) 
                : ConversationDto.error(
                    result.error.code, 
                    result.error.message, 
                    result.error.details
                )
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
                ? ConversationDto.success(result.data) 
                : ConversationDto.error(
                    result.error.code, 
                    result.error.message, 
                    result.error.details
                )
        );
    }
    
    getUnreadCount = async (req, res) => {
        const userId = req.user.id;
        
        const result = await this.messageService.getUnreadMessagesCount(userId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? ConversationDto.success(result.data) 
                : ConversationDto.error(
                    result.error.code, 
                    result.error.message, 
                    result.error.details
                )
        );
    }
}

module.exports = new ConversationController(); 