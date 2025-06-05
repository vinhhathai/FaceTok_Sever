"use strict";
//----------------------------------------------------------------
const MessageService = require('../services/MessageService');
const { MessageDto } = require('../dtos');

/**
 * Socket.IO handler for message module
 */
class MessageSocket {
    constructor(io) {
        this.io = io;
        this.messageService = MessageService;
        this.userSocketMap = new Map(); // Map userId to socketId
    }

    /**
     * Initialize socket events
     */
    init() {
        const messageNamespace = this.io.of('/message');
        
        messageNamespace.on('connection', (socket) => {
            console.log('User connected to message namespace:', socket.id);
            
            // Handle user authentication
            socket.on('authenticate', (userId) => {
                if (userId) {
                    // Store user's socket connection
                    this.userSocketMap.set(userId, socket.id);
                    socket.userId = userId;
                    
                    // Join a personal room for targeted messages
                    socket.join(`user:${userId}`);
                    
                    console.log(`User ${userId} authenticated on socket ${socket.id}`);
                }
            });
            
            // Handle sending message
            socket.on('send_message', async (data) => {
                const { receiverId, content } = data;
                
                if (!socket.userId || !receiverId || !content) {
                    socket.emit('message_error', {
                        message: 'Invalid message data'
                    });
                    return;
                }
                
                try {
                    // Process and save the message
                    const result = await this.messageService.sendMessage(
                        socket.userId,
                        receiverId,
                        content
                    );
                    
                    if (!result.success) {
                        socket.emit('message_error', {
                            message: result.error.message
                        });
                        return;
                    }
                    
                    // Emit message to sender for confirmation
                    socket.emit('message_sent', result.data);
                    
                    // Emit message to receiver if online
                    this.sendToUser(receiverId, 'message_received', {
                        message: result.data.message,
                        room: result.data.room,
                        sender: {
                            id: socket.userId
                        }
                    });
                } catch (error) {
                    console.error('Error handling socket message:', error);
                    socket.emit('message_error', {
                        message: 'Server error processing message'
                    });
                }
            });
            
            /* Temporarily disabled typing indicator functionality
            // Handle typing indicator
            socket.on('typing', (data) => {
                const { receiverId } = data;
                
                if (!socket.userId || !receiverId) return;
                
                this.sendToUser(receiverId, 'user_typing', {
                    senderId: socket.userId
                });
            });
            
            // Handle stop typing
            socket.on('stop_typing', (data) => {
                const { receiverId } = data;
                
                if (!socket.userId || !receiverId) return;
                
                this.sendToUser(receiverId, 'user_stop_typing', {
                    senderId: socket.userId
                });
            });
            */
            
            /* Temporarily disabled mark as read functionality
            // Handle mark as read
            socket.on('mark_read', async (data) => {
                const { roomId, messageIds } = data;
                
                if (!socket.userId || !roomId) return;
                
                try {
                    const result = await this.messageService.markAsRead(roomId, socket.userId);
                    
                    if (result.success) {
                        socket.to(`room:${roomId}`).emit('messages_read', {
                            roomId: roomId,
                            userId: socket.userId
                        });
                    }
                } catch (error) {
                    console.error('Error marking messages as read:', error);
                }
            });
            */
            
            // Handle joining a room
            socket.on('join_room', (roomId) => {
                if (roomId) {
                    socket.join(`room:${roomId}`);
                }
            });
            
            // Handle leaving a room
            socket.on('leave_room', (roomId) => {
                if (roomId) {
                    socket.leave(`room:${roomId}`);
                }
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.userSocketMap.delete(socket.userId);
                    console.log(`User ${socket.userId} disconnected`);
                }
            });
        });
    }
    
    /**
     * Send a message to a specific user
     * @param {String} userId - User ID to send message to
     * @param {String} event - Event name
     * @param {Object} data - Data to send
     */
    sendToUser(userId, event, data) {
        this.io.of('/message').to(`user:${userId}`).emit(event, data);
    }
    
    /**
     * Broadcast a message to all connected users
     * @param {String} event - Event name
     * @param {Object} data - Data to send
     */
    broadcast(event, data) {
        this.io.of('/message').emit(event, data);
    }
    
    /**
     * Broadcast a message to all users in a room
     * @param {String} roomId - Room ID
     * @param {String} event - Event name
     * @param {Object} data - Data to send
     */
    sendToRoom(roomId, event, data) {
        this.io.of('/message').to(`room:${roomId}`).emit(event, data);
    }
}

module.exports = MessageSocket; 