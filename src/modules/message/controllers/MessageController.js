"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');
const { MessageDto } = require('../dtos');
const { createDirectRoomValidation, sendMessageValidation } = require('../validations');
const { VALIDATION_ERRORS, MESSAGE_ERRORS } = require('../../../shared/common/error');

class MessageController {
    constructor() {
        this.messageService = MessageService;
    }

    /**
     * Send a message to another user
     */
    sendMessage = async (req, res) => {
        try {
            const senderId = req.user.id; // Get from authenticated user
            
            // Validate input data using Joi schema
            const { error, value } = sendMessageValidation.validate(req.body);
            
            // If validation fails, return error message
            if (error) {
                return res.status(400).json(
                    MessageDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        error.details[0].message
                    )
                );
            }
            
            const { receiverId, content } = value;
            
            const result = await this.messageService.sendMessage(
                senderId,
                receiverId,
                content
            );
            
            return res.status(result.statusCode).json(
                result.success 
                    ? MessageDto.success(result.data) 
                    : MessageDto.error(
                        result.error.code,
                        result.error.message,
                        result.error.details
                    )
            );
        } catch (error) {
            console.error('Error in sendMessage controller:', error);
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.SEND_MESSAGE_FAILED,
                    'Unable to send message',
                    error.message
                )
            );
        }
    }
    
    /**
     * Mark messages as read in a chat room
     */
    markAsRead = async (req, res) => {
        const userId = req.user.id;
        const { roomId } = req.params;
        
        const result = await this.messageService.markAsRead(roomId, userId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? MessageDto.success(result.data) 
                : MessageDto.error(
                    result.error.code,
                    result.error.message,
                    result.error.details
                )
        );
    }

    /**
     * Create a new chat room between the current user and another user
     */
    createRoom = async (req, res) => {
        try {
            const currentUserId = req.user.id;
            
            // Validate input data using Joi schema
            const { error, value } = createDirectRoomValidation.validate(req.body);
            
            // If validation fails, return error message
            if (error) {
                return res.status(400).json(
                    MessageDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        error.details[0].message,
                    )
                );
            }
            
            // Call service to create direct chat room
            const result = await this.messageService.createDirectRoom(
                currentUserId,
                value.targetUserId
            );
            
            return res.status(result.statusCode).json(
                result.success 
                    ? MessageDto.success(result.data) 
                    : MessageDto.error(
                        result.error.code,
                        result.error.message,
                        result.error.details
                    )
            );
        } catch (error) {
            console.error('Error in createRoom controller:', error);
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.GET_CONVERSATIONS_FAILED,
                    'Unable to create chat room',
                    error.message
                )
            );
        }
    }

    // Other methods will be added in the future
}

module.exports = new MessageController(); 