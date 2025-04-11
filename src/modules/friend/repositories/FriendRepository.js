"use strict";
//----------------------------------------------------------------
const FriendRequestModel = require('../models/FriendRequestModel');
const UserModel = require('../../user/models/UserModel');

class FriendRepository {
    constructor() {
        this.friendRequestModel = FriendRequestModel;
        this.userModel = UserModel;
        this.STATUS = FriendRequestModel.STATUS;
    }

    async getFriendRequest(senderId, recipientId) {
        return this.friendRequestModel.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });
    }

    async getFriendRequestById(requestId) {
        return this.friendRequestModel.findById(requestId);
    }

    async getPendingRequests(userId) {
        return this.friendRequestModel.find({
            recipient: userId,
            status: this.STATUS.PENDING
        })
        .populate('sender', 'fullName profilePicture')
        .sort({ createdAt: -1 });
    }

    async getSentRequests(userId) {
        return this.friendRequestModel.find({
            sender: userId,
            status: this.STATUS.PENDING
        })
        .populate('recipient', 'fullName profilePicture')
        .sort({ createdAt: -1 });
    }

    async checkFriendship(userId1, userId2) {
        // Kiểm tra xem có yêu cầu kết bạn đã được chấp nhận không
        const request = await this.friendRequestModel.findOne({
            $or: [
                { sender: userId1, recipient: userId2 },
                { sender: userId2, recipient: userId1 }
            ],
            status: this.STATUS.ACCEPTED
        });
        
        if (request) return true;
        
        // Kiểm tra trong danh sách bạn bè của cả hai người dùng
        const user1 = await this.userModel.findById(userId1);
        if (user1 && user1.friends && user1.friends.includes(userId2)) return true;
        
        const user2 = await this.userModel.findById(userId2);
        if (user2 && user2.friends && user2.friends.includes(userId1)) return true;
        
        return false;
    }

    async createFriendRequest(senderId, recipientId) {
        // Kiểm tra xem yêu cầu đã tồn tại chưa
        const existingRequest = await this.getFriendRequest(senderId, recipientId);
        if (existingRequest) {
            // Nếu yêu cầu đã bị từ chối trước đó, cập nhật lại trạng thái
            if (existingRequest.status === this.STATUS.REJECTED) {
                existingRequest.status = this.STATUS.PENDING;
                existingRequest.sender = senderId;
                existingRequest.recipient = recipientId;
                return existingRequest.save();
            }
            return existingRequest;
        }
        
        // Tạo yêu cầu mới
        return this.friendRequestModel.create({
            sender: senderId,
            recipient: recipientId,
            status: this.STATUS.PENDING
        });
    }

    async acceptFriendRequest(requestId) {
        const request = await this.friendRequestModel.findById(requestId);
        if (!request) return null;
        
        // Cập nhật trạng thái yêu cầu
        request.status = this.STATUS.ACCEPTED;
        await request.save();
        
        // Cập nhật danh sách bạn bè của cả hai người dùng
        await this.userModel.findByIdAndUpdate(
            request.sender,
            { $addToSet: { friends: request.recipient } }
        );
        
        await this.userModel.findByIdAndUpdate(
            request.recipient,
            { $addToSet: { friends: request.sender } }
        );
        
        return request;
    }

    async rejectFriendRequest(requestId) {
        const request = await this.friendRequestModel.findById(requestId);
        if (!request) return null;
        
        request.status = this.STATUS.REJECTED;
        return request.save();
    }

    async removeFriend(userId1, userId2) {
        // Xóa trong danh sách bạn bè của cả hai người dùng
        await this.userModel.findByIdAndUpdate(
            userId1,
            { $pull: { friends: userId2 } }
        );
        
        await this.userModel.findByIdAndUpdate(
            userId2,
            { $pull: { friends: userId1 } }
        );
        
        // Xóa yêu cầu kết bạn nếu có
        await this.friendRequestModel.findOneAndDelete({
            $or: [
                { sender: userId1, recipient: userId2 },
                { sender: userId2, recipient: userId1 }
            ]
        });
        
        return true;
    }

    async getFriendsList(userId) {
        const user = await this.userModel.findById(userId)
            .populate('friends', 'fullName profilePicture email');
        
        return user ? user.friends : [];
    }

    async deleteFriendRequest(requestId) {
        return this.friendRequestModel.findByIdAndDelete(requestId);
    }
}

module.exports = FriendRepository; 