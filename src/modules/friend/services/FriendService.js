"use strict";
//----------------------------------------------------------------
const FriendRepository = require('../repositories/FriendRepository');
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class FriendService {
    constructor() {
        this.friendRepository = new FriendRepository();
    }

    async getFriendsList(userId) {
        try {
            const friends = await this.friendRepository.getFriendsList(userId);
            
            return {
                success: true,
                statusCode: 200,
                data: friends
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

    async sendFriendRequest(senderId, recipientId) {
        try {
            // Kiểm tra xem người dùng đang gửi yêu cầu cho chính mình
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
            
            // Kiểm tra xem họ đã là bạn bè chưa
            const areFriends = await this.friendRepository.checkFriendship(senderId, recipientId);
            if (areFriends) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'ALREADY_FRIENDS',
                        message: 'Users are already friends'
                    }
                };
            }
            
            // Tạo yêu cầu kết bạn mới
            const request = await this.friendRepository.createFriendRequest(senderId, recipientId);
            
            return {
                success: true,
                statusCode: 201,
                data: request
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ADD_FRIEND_FAILED,
                    message: error.message
                }
            };
        }
    }

    async getPendingRequests(userId) {
        try {
            const requests = await this.friendRepository.getPendingRequests(userId);
            
            return {
                success: true,
                statusCode: 200,
                data: requests
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

    async getSentRequests(userId) {
        try {
            const requests = await this.friendRepository.getSentRequests(userId);
            
            return {
                success: true,
                statusCode: 200,
                data: requests
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

    async acceptFriendRequest(requestId, userId) {
        try {
            const request = await this.friendRepository.getFriendRequestById(requestId);
            
            if (!request) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.FRIEND_NOT_FOUND,
                        message: 'Friend request not found'
                    }
                };
            }
            
            // Kiểm tra quyền (chỉ người nhận yêu cầu mới có thể chấp nhận)
            if (request.recipient.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            // Kiểm tra trạng thái yêu cầu
            if (request.status !== this.friendRepository.STATUS.PENDING) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST_STATUS',
                        message: 'Friend request is not pending'
                    }
                };
            }
            
            const updatedRequest = await this.friendRepository.acceptFriendRequest(requestId);
            
            return {
                success: true,
                statusCode: 200,
                data: updatedRequest
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

    async rejectFriendRequest(requestId, userId) {
        try {
            const request = await this.friendRepository.getFriendRequestById(requestId);
            
            if (!request) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.FRIEND_NOT_FOUND,
                        message: 'Friend request not found'
                    }
                };
            }
            
            // Kiểm tra quyền (chỉ người nhận yêu cầu mới có thể từ chối)
            if (request.recipient.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            // Kiểm tra trạng thái yêu cầu
            if (request.status !== this.friendRepository.STATUS.PENDING) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST_STATUS',
                        message: 'Friend request is not pending'
                    }
                };
            }
            
            const updatedRequest = await this.friendRepository.rejectFriendRequest(requestId);
            
            return {
                success: true,
                statusCode: 200,
                data: updatedRequest
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

    async removeFriend(userId, friendId) {
        try {
            // Kiểm tra xem họ có phải bạn bè không
            const areFriends = await this.friendRepository.checkFriendship(userId, friendId);
            if (!areFriends) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'NOT_FRIENDS',
                        message: 'Users are not friends'
                    }
                };
            }
            
            await this.friendRepository.removeFriend(userId, friendId);
            
            return {
                success: true,
                statusCode: 200,
                data: { message: 'Friend removed successfully' }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.REMOVE_FRIEND_FAILED,
                    message: error.message
                }
            };
        }
    }

    async checkFriendshipStatus(userId1, userId2) {
        try {
            // Kiểm tra xem người dùng đang kiểm tra chính mình
            if (userId1 === userId2) {
                return {
                    success: true,
                    statusCode: 200,
                    data: { status: 'SELF' }
                };
            }
            
            // Kiểm tra xem họ đã là bạn bè chưa
            const areFriends = await this.friendRepository.checkFriendship(userId1, userId2);
            if (areFriends) {
                return {
                    success: true,
                    statusCode: 200,
                    data: { status: 'FRIENDS' }
                };
            }
            
            // Kiểm tra xem có yêu cầu kết bạn nào không
            const request = await this.friendRepository.getFriendRequest(userId1, userId2);
            if (request) {
                if (request.status === this.friendRepository.STATUS.PENDING) {
                    if (request.sender.toString() === userId1.toString()) {
                        return {
                            success: true,
                            statusCode: 200,
                            data: { status: 'REQUEST_SENT', requestId: request._id }
                        };
                    } else {
                        return {
                            success: true,
                            statusCode: 200,
                            data: { status: 'REQUEST_RECEIVED', requestId: request._id }
                        };
                    }
                } else if (request.status === this.friendRepository.STATUS.REJECTED) {
                    return {
                        success: true,
                        statusCode: 200,
                        data: { status: 'REQUEST_REJECTED', requestId: request._id }
                    };
                }
            }
            
            // Không có mối quan hệ
            return {
                success: true,
                statusCode: 200,
                data: { status: 'NOT_FRIENDS' }
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

    async cancelFriendRequest(senderId, recipientId) {
        try {
            // Kiểm tra yêu cầu kết bạn
            const request = await this.friendRepository.getFriendRequest(senderId, recipientId);
            
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
            
            // Kiểm tra xem người dùng có phải là người gửi yêu cầu không
            if (request.sender.toString() !== senderId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: 'You cannot cancel a request you did not send'
                    }
                };
            }
            
            // Kiểm tra trạng thái yêu cầu
            if (request.status !== this.friendRepository.STATUS.PENDING) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_REQUEST_STATUS',
                        message: 'Friend request is not pending'
                    }
                };
            }
            
            // Xóa yêu cầu kết bạn
            await this.friendRepository.deleteFriendRequest(request._id);
            
            return {
                success: true,
                statusCode: 200,
                data: { message: 'Friend request cancelled successfully' }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }
}

// Export instance của service
module.exports = new FriendService(); 