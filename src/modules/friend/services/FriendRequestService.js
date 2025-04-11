"use strict";
//----------------------------------------------------------------
const FriendRequest = require('../models/FriendRequestModel');
const UserRepository = require('../../user/repositories/UserRepository');

class FriendRequestService {
    async sendFriendRequest(senderId, recipientId) {
        try {
            // Kiểm tra người dùng có tồn tại không
            const [sender, recipient] = await Promise.all([
                UserRepository.findById(senderId),
                UserRepository.findById(recipientId)
            ]);
            
            if (!sender || !recipient) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'One or both users not found'
                    }
                };
            }
            
            // Kiểm tra không thể tự kết bạn với chính mình
            if (senderId === recipientId) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Cannot send friend request to yourself'
                    }
                };
            }
            
            // Kiểm tra xem đã là bạn bè chưa
            const existingFriendship = await Friend.findOne({
                $or: [
                    { user1: senderId, user2: recipientId },
                    { user1: recipientId, user2: senderId }
                ]
            });
            
            if (existingFriendship) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'ALREADY_FRIENDS',
                        message: 'Users are already friends'
                    }
                };
            }
            
            // Kiểm tra xem đã có yêu cầu kết bạn chưa
            const existingRequest = await FriendRequest.findOne({
                sender: senderId,
                recipient: recipientId,
                status: 'pending'
            });
            
            if (existingRequest) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'REQUEST_EXISTS',
                        message: 'Friend request already exists'
                    }
                };
            }
            
            // Kiểm tra xem có yêu cầu kết bạn ngược lại không
            const reverseRequest = await FriendRequest.findOne({
                sender: recipientId,
                recipient: senderId,
                status: 'pending'
            });
            
            if (reverseRequest) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'REVERSE_REQUEST_EXISTS',
                        message: 'There is already a pending request from the recipient'
                    }
                };
            }
            
            // Tạo yêu cầu kết bạn mới
            const newRequest = await FriendRequest.create({
                sender: senderId,
                recipient: recipientId,
                status: 'pending',
                createdAt: new Date()
            });
            
            return {
                success: true,
                statusCode: 201,
                data: {
                    requestId: newRequest._id,
                    message: 'Friend request sent successfully'
                }
            };
        } catch (error) {
            console.error('Error in sendFriendRequest:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to send friend request');
        }
    }
    
    async acceptFriendRequest(requestId, recipientId) {
        try {
            // Tìm yêu cầu kết bạn
            const request = await FriendRequest.findById(requestId);
            if (!request) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'REQUEST_NOT_FOUND',
                        message: 'Friend request not found'
                    }
                };
            }
            
            // Kiểm tra người nhận có đúng không
            if (request.recipient.toString() !== recipientId) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Not authorized to accept this request'
                    }
                };
            }
            
            // Kiểm tra trạng thái yêu cầu
            if (request.status !== 'pending') {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST_STATUS',
                        message: `Request is already ${request.status}`
                    }
                };
            }
            
            // Cập nhật trạng thái yêu cầu
            request.status = 'accepted';
            request.updatedAt = new Date();
            await request.save();
            
            // Tạo quan hệ bạn bè
            await Friend.create({
                user1: request.sender,
                user2: request.recipient,
                createdAt: new Date()
            });
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    requestId: request._id,
                    message: 'Friend request accepted successfully'
                }
            };
        } catch (error) {
            console.error('Error in acceptFriendRequest:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to accept friend request');
        }
    }
    
    async rejectFriendRequest(requestId, recipientId) {
        try {
            // Tìm yêu cầu kết bạn
            const request = await FriendRequest.findById(requestId);
            if (!request) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'REQUEST_NOT_FOUND',
                        message: 'Friend request not found'
                    }
                };
            }
            
            // Kiểm tra người nhận có đúng không
            if (request.recipient.toString() !== recipientId) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Not authorized to reject this request'
                    }
                };
            }
            
            // Kiểm tra trạng thái yêu cầu
            if (request.status !== 'pending') {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST_STATUS',
                        message: `Request is already ${request.status}`
                    }
                };
            }
            
            // Cập nhật trạng thái yêu cầu
            request.status = 'rejected';
            request.updatedAt = new Date();
            await request.save();
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    requestId: request._id,
                    message: 'Friend request rejected successfully'
                }
            };
        } catch (error) {
            console.error('Error in rejectFriendRequest:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to reject friend request');
        }
    }
    
    async cancelFriendRequest(requestId, senderId) {
        try {
            // Tìm yêu cầu kết bạn
            const request = await FriendRequest.findById(requestId);
            if (!request) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'REQUEST_NOT_FOUND',
                        message: 'Friend request not found'
                    }
                };
            }
            
            // Kiểm tra người gửi có đúng không
            if (request.sender.toString() !== senderId) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Not authorized to cancel this request'
                    }
                };
            }
            
            // Kiểm tra trạng thái yêu cầu
            if (request.status !== 'pending') {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST_STATUS',
                        message: `Request is already ${request.status}`
                    }
                };
            }
            
            // Cập nhật trạng thái yêu cầu
            request.status = 'cancelled';
            request.updatedAt = new Date();
            await request.save();
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    requestId: request._id,
                    message: 'Friend request cancelled successfully'
                }
            };
        } catch (error) {
            console.error('Error in cancelFriendRequest:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to cancel friend request');
        }
    }
    
    async getPendingFriendRequests(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            // Tìm các yêu cầu kết bạn đang chờ xử lý
            const requests = await FriendRequest.find({
                recipient: userId,
                status: 'pending'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username profile.fullName profile.profilePicture profile.thumbnail');
            
            // Tổng số yêu cầu
            const total = await FriendRequest.countDocuments({
                recipient: userId,
                status: 'pending'
            });
            
            // Format response
            const formattedRequests = requests.map(request => ({
                id: request._id,
                sender: {
                    id: request.sender._id,
                    username: request.sender.username,
                    fullName: request.sender.profile.fullName,
                    profilePicture: request.sender.profile.profilePicture,
                    thumbnail: request.sender.profile.thumbnail
                },
                createdAt: request.createdAt
            }));
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    requests: formattedRequests,
                    pagination: {
                        total,
                        page,
                        limit,
                        pages: Math.ceil(total / limit)
                    }
                }
            };
        } catch (error) {
            console.error('Error in getPendingFriendRequests:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to get pending friend requests');
        }
    }
}

module.exports = new FriendRequestService(); 