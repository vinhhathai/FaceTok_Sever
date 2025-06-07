"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');
const { RoomDto } = require('../dtos');
const { getRoomsValidation, getRoomDetailsValidation, getRoomByIdValidation } = require('../validations');
const { VALIDATION_ERRORS } = require('../../../shared/common/error');

class RoomController {
    constructor() {
        this.messageService = MessageService;
    }

    /**
     * Get the list of recent chat rooms
     */
    getRooms = async (req, res) => {
        try {
            // Validate query parameters
            const { error, value } = getRoomsValidation.validate(req.query);
            
            if (error) {
                return res.status(400).json(
                    RoomDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        error.details[0].message,
                        error.details
                    )
                );
            }
            
            const userId = req.user.id;
            const limit = value.limit;
            
            const result = await this.messageService.getRooms(userId, limit);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? RoomDto.success(result.data) 
                    : RoomDto.error(
                        result.error.code, 
                        result.error.message, 
                        result.error.details
                    )
            );
        } catch (error) {
            console.error('Error in getRooms controller:', error);
            return res.status(500).json(
                RoomDto.error(
                    'INTERNAL_SERVER_ERROR',
                    'Internal server error',
                    error.message
                )
            );
        }
    }

    /**
     * Get chat room details with a specific user
     */
    getRoomDetails = async (req, res) => {
        try {
            const currentUserId = req.user.id;
            const otherUserId = req.params.userId;
            
            // Validate parameters
            const { error, value } = getRoomDetailsValidation.validate({
                userId: otherUserId,
            });
            
            if (error) {
                return res.status(400).json(
                    RoomDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        error.details[0].message,
                        error.details
                    )
                );
            }
            
            const result = await this.messageService.getRoomDetails(
                currentUserId, 
                value.userId, 
            );
            
            return res.status(result.statusCode).json(
                result.success 
                    ? RoomDto.success(result.data) 
                    : RoomDto.error(
                        result.error.code, 
                        result.error.message, 
                        result.error.details
                    )
            );
        } catch (error) {
            console.error('Error in getRoomDetails controller:', error);
            return res.status(500).json(
                RoomDto.error(
                    'INTERNAL_SERVER_ERROR',
                    'Internal server error',
                    error.message
                )
            );
        }
    }
    
    /**
     * Get unread message count
     */
    getUnreadCount = async (req, res) => {
        try {
            const userId = req.user.id;
            
            const result = await this.messageService.getUnreadCount(userId);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? RoomDto.success(result.data) 
                    : RoomDto.error(
                        result.error.code, 
                        result.error.message, 
                        result.error.details
                    )
            );
        } catch (error) {
            console.error('Error in getUnreadCount controller:', error);
            return res.status(500).json(
                RoomDto.error(
                    'INTERNAL_SERVER_ERROR',
                    'Internal server error',
                    error.message
                )
            );
        }
    }

    /**
     * Get room and messages by room ID
     */
    getRoomById = async (req, res) => {
        try {
            const roomId = req.params.roomId;
            const userId = req.user.id;
            
            // Validate parameters
            const { error } = getRoomByIdValidation.validate({
                roomId
            });
            
            if (error) {
                return res.status(400).json(
                    RoomDto.error(
                        VALIDATION_ERRORS.INVALID_INPUT,
                        error.details[0].message,
                        error.details
                    )
                );
            }
            
            const result = await this.messageService.getRoomById(roomId, userId);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? RoomDto.success(result.data) 
                    : RoomDto.error(
                        result.error.code, 
                        result.error.message, 
                        result.error.details
                    )
            );
        } catch (error) {
            console.error('Error in getRoomById controller:', error);
            return res.status(500).json(
                RoomDto.error(
                    'INTERNAL_SERVER_ERROR',
                    'Internal server error',
                    error.message
                )
            );
        }
    }
}

module.exports = new RoomController(); 