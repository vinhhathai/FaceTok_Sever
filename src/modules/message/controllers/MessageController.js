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
     * @deprecated Use getOrCreateRoom and createMessageInRoom instead
     * Send a message to another user
     */
    sendMessage = async (req, res) => {
        return res.status(400).json(
            MessageDto.error(
                VALIDATION_ERRORS.INVALID_INPUT,
                'This endpoint is deprecated. Please use GET /room/get-or-create to get a room, then POST /room/:roomId/message to send messages.'
            )
        );
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
     * @deprecated Use getOrCreateRoom instead
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
                const room = await this.messageService.getOrCreateRoom(
                    currentUserId,
                    value.targetUserId
                );
                
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
            const { limit = 10, skip = 0 } = req.query;
            
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

    /**
     * Tìm hoặc tạo phòng chat giữa người dùng hiện tại và người dùng khác
     */
    getOrCreateRoom = async (req, res) => {
        try {
            const currentUserId = req.user.id;
            
            // Validate input data
            const { targetUserId } = req.body;
            
            if (!targetUserId) {
                return res.status(400).json(
                    MessageDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        'Target user ID is required'
                    )
                );
            }
            
            try {
                // Tìm hoặc tạo phòng chat
                const room = await this.messageService.getOrCreateRoom(
                    currentUserId,
                    targetUserId
                );
                
                return res.status(200).json(
                    MessageDto.success({
                        room: room
                    })
                );
            } catch (error) {
                return res.status(500).json(
                    MessageDto.error(
                        MESSAGE_ERRORS.CREATE_ROOM_FAILED,
                        'Failed to get or create chat room',
                        error.message
                    )
                );
            }
        } catch (error) {
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.CREATE_ROOM_FAILED,
                    'Unable to get or create chat room',
                    error.message
                )
            );
        }
    }

    /**
     * Tạo tin nhắn trong phòng đã tồn tại
     */
    createMessageInRoom = async (req, res) => {
        try {
            const senderId = req.user.id;
            const { roomId } = req.params;
            const { content } = req.body;
            
            if (!roomId || !content) {
                return res.status(400).json(
                    MessageDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        'Room ID and content are required'
                    )
                );
            }
            
            try {
                const result = await this.messageService.createMessageInRoom(
                    senderId,
                    roomId,
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
                        'Failed to create message',
                        error.message
                    )
                );
            }
        } catch (error) {
            return res.status(500).json(
                MessageDto.error(
                    MESSAGE_ERRORS.SEND_MESSAGE_FAILED,
                    'Unable to create message',
                    error.message
                )
            );
        }
    }
}

module.exports = new MessageController(); 