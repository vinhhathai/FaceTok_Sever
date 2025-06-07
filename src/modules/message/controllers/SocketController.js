"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');
const { MessageDto } = require('../dtos');
const jwt = require('jsonwebtoken');

class SocketController {
    constructor() {
        this.messageService = MessageService;
    }

    /**
     * Xác thực người dùng qua token
     */
    authenticateUser = async (token) => {
        try {
            // Xác thực token JWT
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
            if (!decoded || !decoded.userId) {
                return {
                    success: false,
                    message: 'Invalid token'
                };
            }

            return {
                success: true,
                userId: decoded.userId
            };
        } catch (error) {
            console.error("JWT authentication error:", error);
            return {
                success: false,
                message: 'Authentication failed'
            };
        }
    }

    /**
     * Gửi tin nhắn
     */
    sendMessage = async (senderId, receiverId, content) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!receiverId || !content) {
                return {
                    success: false,
                    message: 'Invalid message data'
                };
            }

            // Gọi đến service để xử lý
            const result = await this.messageService.sendMessage(
                senderId,
                receiverId,
                content
            );

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error("Error in sendMessage controller:", error);
            return {
                success: false,
                message: 'Failed to send message',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách phòng chat của người dùng
     */
    getUserRooms = async (userId) => {
        try {
            const rooms = await this.messageService.getUserRooms(userId);
            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            console.error("Error in getUserRooms controller:", error);
            return {
                success: false,
                message: 'Failed to get rooms',
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách tin nhắn trong phòng
     */
    getMessages = async (roomId, limit = 20, skip = 0) => {
        try {
            if (!roomId) {
                return {
                    success: false,
                    message: 'Room ID is required'
                };
            }

            const messages = await this.messageService.getMessages(
                roomId,
                parseInt(limit) || 20,
                parseInt(skip) || 0
            );
            
            return {
                success: true,
                data: messages
            };
        } catch (error) {
            console.error("Error in getMessages controller:", error);
            return {
                success: false,
                message: 'Failed to get messages',
                error: error.message
            };
        }
    }
}

module.exports = new SocketController(); 