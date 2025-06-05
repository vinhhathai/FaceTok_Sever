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
        this.socketIdMap = new Map(); // Map socketId to userId
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
                    // Kiểm tra xem userId này đã có socket nào chưa
                    const existingSocketId = this.userSocketMap.get(userId);
                    
                    // Cập nhật maps
                    this.userSocketMap.set(userId, socket.id);
                    this.socketIdMap.set(socket.id, userId);
                    socket.userId = userId;
                    
                    // Join a personal room for targeted messages
                    socket.join(`user:${userId}`);
                    
                    console.log(`User ${userId} authenticated on socket ${socket.id}`);
                    console.log('Current user socket map:', [...this.userSocketMap.entries()]);
                } else {
                    // Log warning for missing userId
                    console.warn(`Socket ${socket.id} attempted authentication without a valid userId`);
                }
            });
            
            // Handle sending message
            socket.on('send_message', async (data) => {
                console.log(`[MESSAGE RECEIVED] User ${socket.userId} is sending message:`, data);
                const { receiverId, content } = data;
                
                if (!socket.userId || !receiverId || !content) {
                    console.error('Invalid message data:', { 
                        userId: socket.userId, 
                        receiverId, 
                        contentExists: !!content 
                    });
                    socket.emit('message_error', {
                        message: 'Invalid message data'
                    });
                    return;
                }
                
                try {
                    console.log(`Processing message from ${socket.userId} to ${receiverId}: "${content}"`);
                    
                    // Process and save the message
                    const result = await this.messageService.sendMessage(
                        socket.userId,
                        receiverId,
                        content
                    );
                    
                    if (!result.success) {
                        console.error('Error sending message:', result.error);
                        socket.emit('message_error', {
                            message: result.error.message
                        });
                        return;
                    }
                    
                    console.log('Message saved successfully:', {
                        messageId: result.data.message._id,
                        roomId: result.data.room._id,
                        senderId: socket.userId,
                        receiverId: receiverId
                    });
                    
                    // Log the full message data for debugging
                    console.log('Complete message data:', JSON.stringify(result.data));
                    
                    // Emit message to sender for confirmation
                    socket.emit('message_sent', result.data);
                    console.log(`Sent confirmation to sender ${socket.userId} via 'message_sent' event`);
                    
                    // Check if receiver is online
                    const receiverSocketId = this.userSocketMap.get(receiverId);
                    console.log(`Receiver ${receiverId} socket: ${receiverSocketId || 'offline'}`);
                    
                    // Emit message to receiver if online
                    this.sendToUser(receiverId, 'message_received', {
                        message: result.data.message,
                        room: result.data.room,
                        sender: {
                            id: socket.userId
                        }
                    });
                    console.log(`Sent message notification to receiver ${receiverId} via 'message_received' event`);
                } catch (error) {
                    console.error('Error handling socket message:', error);
                    socket.emit('message_error', {
                        message: 'Server error processing message'
                    });
                }
            });
            
            // Handle joining a room
            socket.on('join_room', (roomId) => {
                if (roomId) {
                    socket.join(`room:${roomId}`);
                    console.log(`Socket ${socket.id} (User ${socket.userId}) joined room: ${roomId}`);
                }
            });
            
            // Handle leaving a room
            socket.on('leave_room', (roomId) => {
                if (roomId) {
                    socket.leave(`room:${roomId}`);
                    console.log(`Socket ${socket.id} (User ${socket.userId}) left room: ${roomId}`);
                }
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                const userId = this.socketIdMap.get(socket.id);
                
                // Chỉ xử lý nếu socket này được liên kết với một userId
                if (userId) {
                    // Xóa các mối liên kết trong maps
                    this.socketIdMap.delete(socket.id);
                    
                    // Kiểm tra xem người dùng còn socket nào khác không
                    const currentSocketForUser = this.userSocketMap.get(userId);
                    if (currentSocketForUser === socket.id) {
                        // Nếu socket hiện tại là socket duy nhất của user, xóa user khỏi map
                        this.userSocketMap.delete(userId);
                        console.log(`User ${userId} disconnected`);
                    }
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
        console.log(`Sending '${event}' event to user ${userId}`, { 
            dataKeys: Object.keys(data),
            room: `user:${userId}`
        });
        this.io.of('/message').to(`user:${userId}`).emit(event, data);
    }
    
    /**
     * Broadcast a message to all users in a room
     * @param {String} roomId - Room ID
     * @param {String} event - Event name
     * @param {Object} data - Data to send
     */
    sendToRoom(roomId, event, data) {
        console.log(`Broadcasting '${event}' event to room ${roomId}`);
        this.io.of('/message').to(`room:${roomId}`).emit(event, data);
    }
}

module.exports = MessageSocket; 