"use strict";
//----------------------------------------------------------------
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const UserModel = require('../../modules/user/models/UserModel');

class SocketService {
    constructor() {
        this.io = null;
        this.users = new Map(); // Map userId -> socketId
        this.initialized = false;
    }

    initialize(server) {
        if (this.initialized) {
            console.log('Socket service is already initialized');
            return this.io;
        }

        this.io = socketIO(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        this.io.use(async (socket, next) => {
            try {
                // Xác thực người dùng thông qua token
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error: Token required'));
                }

                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
                const user = await UserModel.findById(decoded._id).select('-password');

                if (!user) {
                    return next(new Error('Authentication error: User not found'));
                }

                // Lưu thông tin người dùng vào socket
                socket.userId = user._id.toString();
                socket.user = {
                    id: user._id.toString(),
                    username: user.username,
                    fullName: user.fullName,
                    profilePicture: user.profilePicture
                };

                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication error: ' + error.message));
            }
        });

        // Xử lý sự kiện kết nối từ client
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);
            this.addUser(socket.userId, socket.id);

            // Gửi danh sách người dùng online khi có kết nối mới
            this.io.emit('onlineUsers', Array.from(this.users.keys()));

            // Xử lý sự kiện gửi tin nhắn
            socket.on('sendMessage', async (data) => {
                const { receiverId, message } = data;
                const senderId = socket.userId;

                // Lấy socketId của người nhận để gửi tin nhắn
                const receiverSocketId = this.getUser(receiverId);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('receiveMessage', {
                        senderId,
                        message,
                        timestamp: new Date()
                    });
                }
            });

            // Xử lý sự kiện typing
            socket.on('typing', (data) => {
                const { receiverId } = data;
                const senderId = socket.userId;

                const receiverSocketId = this.getUser(receiverId);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('userTyping', {
                        senderId
                    });
                }
            });

            // Xử lý sự kiện ngắt kết nối
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.userId}`);
                this.removeUser(socket.userId);
                this.io.emit('onlineUsers', Array.from(this.users.keys()));
            });
        });

        this.initialized = true;
        console.log('Socket service initialized');
        return this.io;
    }

    // Phương thức thêm người dùng
    addUser(userId, socketId) {
        this.users.set(userId, socketId);
    }

    // Phương thức xóa người dùng
    removeUser(userId) {
        this.users.delete(userId);
    }

    // Phương thức lấy socketId của một người dùng
    getUser(userId) {
        return this.users.get(userId);
    }

    // Gửi thông báo cho một người dùng cụ thể
    sendNotification(userId, notification) {
        const socketId = this.getUser(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit('notification', notification);
        }
    }

    // Gửi thông báo cho nhiều người dùng
    broadcastNotification(userIds, notification) {
        if (this.io) {
            userIds.forEach(userId => {
                const socketId = this.getUser(userId);
                if (socketId) {
                    this.io.to(socketId).emit('notification', notification);
                }
            });
        }
    }
}

module.exports = new SocketService(); 