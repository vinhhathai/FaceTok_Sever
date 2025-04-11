"use strict";
//----------------------------------------------------------------
const MessageRepository = require('../repositories/MessageRepository');
const SocketService = require('../../../shared/services/SocketService');
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class MessageService {
    constructor() {
        this.messageRepository = new MessageRepository();
    }

    async getConversationMessages(userId1, userId2, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const messages = await this.messageRepository.findByConversation(
                userId1, 
                userId2, 
                { skip, limit }
            );
            
            // Sau khi lấy tin nhắn, đánh dấu tất cả tin nhắn từ userId2 gửi đến userId1 là đã đọc
            await this.messageRepository.markAllAsRead(userId2, userId1);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    messages,
                    page,
                    limit
                }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_GET_DATA_FAILED,
                    message: error.message
                }
            };
        }
    }

    async sendMessage(senderId, receiverId, text) {
        try {
            if (!text || text.trim() === '') {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'Message text is required'
                    }
                };
            }
            
            const newMessage = await this.messageRepository.createMessage({
                senderId,
                receiverId,
                text
            });
            
            // Gửi tin nhắn thông qua Socket.IO
            const receiverSocketId = SocketService.getUser(receiverId);
            if (receiverSocketId) {
                SocketService.io.to(receiverSocketId).emit('receiveMessage', {
                    senderId,
                    message: newMessage
                });
            }
            
            return {
                success: true,
                statusCode: 201,
                data: newMessage
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.SEND_MESSAGE_FAILED,
                    message: error.message
                }
            };
        }
    }

    async markMessageAsRead(messageId, userId) {
        try {
            const message = await this.messageRepository.findById(messageId);
            
            if (!message) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'MESSAGE_NOT_FOUND',
                        message: 'Message not found'
                    }
                };
            }
            
            // Chỉ người nhận mới có thể đánh dấu tin nhắn là đã đọc
            if (message.receiverId.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            if (message.read) {
                return {
                    success: true,
                    statusCode: 200,
                    data: message
                };
            }
            
            const updatedMessage = await this.messageRepository.markAsRead(messageId);
            
            // Thông báo qua Socket.IO rằng tin nhắn đã được đọc
            const senderSocketId = SocketService.getUser(message.senderId.toString());
            if (senderSocketId) {
                SocketService.io.to(senderSocketId).emit('messageRead', {
                    messageId: messageId
                });
            }
            
            return {
                success: true,
                statusCode: 200,
                data: updatedMessage
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_GET_DATA_FAILED,
                    message: error.message
                }
            };
        }
    }

    async getRecentConversations(userId, limit = 10) {
        try {
            const conversations = await this.messageRepository.getLatestMessages(userId, limit);
            
            return {
                success: true,
                statusCode: 200,
                data: conversations
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_GET_DATA_FAILED,
                    message: error.message
                }
            };
        }
    }

    async getUnreadMessagesCount(userId) {
        try {
            const count = await this.messageRepository.getUnreadMessagesCount(userId);
            
            return {
                success: true,
                statusCode: 200,
                data: { count }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_GET_DATA_FAILED,
                    message: error.message
                }
            };
        }
    }

    // Phương thức cho kiến trúc cũ - lấy tin nhắn theo conversationId
    async getMessagesByConversationId(conversationId, userId, page = 1, limit = 20) {
        try {
            // Kiểm tra xem conversation có tồn tại không
            const conversation = await this.messageRepository.findConversationById(conversationId);
            
            if (!conversation) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'CONVERSATION_NOT_FOUND',
                        message: 'Conversation not found'
                    }
                };
            }
            
            // Kiểm tra người dùng có quyền xem tin nhắn không
            if (conversation.participants.map(p => p.toString()).indexOf(userId.toString()) === -1) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            const skip = (page - 1) * limit;
            const messages = await this.messageRepository.findMessagesByConversationId(
                conversationId,
                { skip, limit }
            );
            
            // Đánh dấu tin nhắn là đã đọc
            const otherParticipantId = conversation.participants.find(
                p => p.toString() !== userId.toString()
            );
            
            if (otherParticipantId) {
                await this.messageRepository.markAllAsRead(otherParticipantId, userId);
            }
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    messages,
                    page,
                    limit
                }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_GET_DATA_FAILED,
                    message: error.message
                }
            };
        }
    }
}

// Export instance thay vì class
module.exports = new MessageService(); 