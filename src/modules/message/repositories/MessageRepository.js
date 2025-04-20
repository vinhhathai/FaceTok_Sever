"use strict";
//----------------------------------------------------------------
const MessageModel = require('../models/MessageModel');

class MessageRepository {
    constructor() {
        this.model = MessageModel;
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async findBySenderId(senderId) {
        return this.model.find({ senderId });
    }

    async findByReceiverId(receiverId) {
        return this.model.find({ receiverId });
    }

    async findByConversation(userId1, userId2, options = { skip: 0, limit: 20 }) {
        return this.model.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit);
    }

    async getUnreadMessagesCount(userId) {
        return this.model.countDocuments({
            receiverId: userId,
            read: false
        });
    }

    async createMessage(messageData) {
        return this.model.create(messageData);
    }

    async markAsRead(messageId) {
        const message = await this.model.findById(messageId);
        if (!message) return null;
        
        await message.markAsRead();
        return message;
    }

    async markAllAsRead(senderId, receiverId) {
        return this.model.updateMany(
            { senderId, receiverId, read: false },
            { $set: { read: true } }
        );
    }

    async deleteMessage(messageId) {
        return this.model.findByIdAndDelete(messageId);
    }

    async getLatestMessages(userId, limit = 10) {
        // Get the latest message from each conversation
        const messages = await this.model.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$senderId', userId] },
                            '$receiverId',
                            '$senderId'
                        ]
                    },
                    messageId: { $first: '$_id' },
                    senderId: { $first: '$senderId' },
                    receiverId: { $first: '$receiverId' },
                    text: { $first: '$text' },
                    read: { $first: '$read' },
                    createdAt: { $first: '$createdAt' }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: limit
            }
        ]);

        return messages;
    }

    // Phương thức cho kiến trúc cũ - Tìm hội thoại theo ID
    async findConversationById(conversationId) {
        // Trong kiến trúc mới, chúng ta không có model Conversation riêng
        // Vì vậy, chúng ta giả định conversationId là một chuỗi
        // định dạng 'userId1_userId2'
        const [user1, user2] = conversationId.split('_');

        // Kiểm tra xem có tin nhắn giữa 2 người này không
        const message = await this.model.findOne({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        });

        if (!message) return null;

        // Trả về một đối tượng hội thoại giả định
        return {
            _id: conversationId,
            participants: [user1, user2]
        };
    }

    // Phương thức cho kiến trúc cũ - Tìm tin nhắn theo ID hội thoại
    async findMessagesByConversationId(conversationId, options = { skip: 0, limit: 20 }) {
        const [user1, user2] = conversationId.split('_');

        return this.model.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit);
    }
}

module.exports = MessageRepository; 