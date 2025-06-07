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
            
            try {
                const result = await this.messageService.sendMessage(
                    senderId,
                    receiverId,
                    content
                );
                
                return res.status(200).json(
                    MessageDto.success({
                        message: result.message,
                        room: result.room
                    })
                );
            } catch (error) {
                return res.status(500).json(
                    MessageDto.error(
                        MESSAGE_ERRORS.SEND_MESSAGE_FAILED,
                        'Failed to send message',
                        error.message
                    )
                );
            }
        } catch (error) {
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
        try {
            const userId = req.user.id;
            const { roomId } = req.params;
            
            if (!roomId) {
                return res.status(400).json(
                    MessageDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        'Room ID is required'
                    )
                );
            }
            
            // Implement later
            return res.status(200).json(
                MessageDto.success({ success: true })
            );
        } catch (error) {
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.MARK_AS_READ_FAILED,
                    'Failed to mark messages as read',
                    error.message
                )
            );
        }
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
            
            try {
                // Tìm hoặc tạo phòng chat
                let room = await this.messageService.getRoomByUsers(
                    currentUserId,
                    value.targetUserId
                );
                
                // Nếu phòng chưa tồn tại, tạo phòng mới
                if (!room) {
                    room = await this.messageService.createRoom(
                        currentUserId,
                        value.targetUserId
                    );
                }
                
                return res.status(200).json(
                    MessageDto.success({
                        room: room
                    })
                );
            } catch (error) {
                return res.status(500).json(
                    MessageDto.error(
                        MESSAGE_ERRORS.CREATE_ROOM_FAILED,
                        'Failed to create chat room',
                        error.message
                    )
                );
            }
        } catch (error) {
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.CREATE_ROOM_FAILED,
                    'Unable to create chat room',
                    error.message
                )
            );
        }
    }

    /**
     * Get messages from a room
     */
    getMessages = async (req, res) => {
        try {
            const { roomId } = req.params;
            const { limit = 20, skip = 0 } = req.query;
            
            if (!roomId) {
                return res.status(400).json(
                    MessageDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        'Room ID is required'
                    )
                );
            }
            
            try {
                const messages = await this.messageService.getMessages(
                    roomId,
                    parseInt(limit),
                    parseInt(skip)
                );
                
                return res.status(200).json(
                    MessageDto.success({
                        messages: messages
                    })
                );
            } catch (error) {
                return res.status(500).json(
                    MessageDto.error(
                        MESSAGE_ERRORS.GET_MESSAGES_FAILED,
                        'Failed to get messages',
                        error.message
                    )
                );
            }
        } catch (error) {
            console.error('Error getting messages:', error);
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.GET_MESSAGES_FAILED,
                    'Unable to get messages',
                    error.message
                )
            );
        }
    }
}

module.exports = new MessageController(); 