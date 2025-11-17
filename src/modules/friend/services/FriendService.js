"use strict";
//----------------------------------------------------------------
const FriendRepository = require("../repositories/FriendRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FriendDto } = require("../dtos");
const FriendRequestModel = require("../models/FriendRequestModel");
const mongoose = require("mongoose");
const NotificationService = require("../../notification/services/NotificationService");
const UserRepository = require("../../user/repositories/UserRepository");

/**
 * Service xử lý chức năng quản lý bạn bè
 */
class FriendService {
  constructor() {
    this.friendRepository = new FriendRepository();
    this.notificationService = new NotificationService();
  }
  
  /**
   * Lấy danh sách bạn bè của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Danh sách bạn bè đã định dạng
   */
  async getFriendsList(userId) {
    try {
      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      const friends = await this.friendRepository.getFriendsList(userId);

      // Count total friends
      const totalFriends = friends.length;

      // Format the data using DTO
      const formattedFriends = FriendDto.toResponseList(friends);

      return FriendDto.success(
        {
          friends: formattedFriends,
          totalFriends: totalFriends,
        },
        "Friends list retrieved successfully"
      );
    } catch (error) {
      console.error("Error in getFriendsList service:", error);
      return FriendDto.error(
        errorCode.GET_FRIENDS_LIST_FAILED,
        "Failed to retrieve friends list",
        error.message
      );
    }
  }

  /**
   * Kiểm tra mối quan hệ giữa người dùng hiện tại và người dùng được chỉ định
   * @param {string} userId - ID của người dùng hiện tại
   * @param {string} targetUserId - ID của người dùng cần kiểm tra mối quan hệ
   * @returns {Promise<Object>} Kết quả chứa thông tin về mối quan hệ
   */
  async checkRelationship(userId, targetUserId) {
    try {
      // Validate input
      if (!userId || !targetUserId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Both user IDs are required"
        );
      }

      if (userId === targetUserId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot check relationship with yourself"
        );
      }

      // Resolve users by ObjectId
      const userRepo = new UserRepository();
      const user = await userRepo.findById(userId);
      const targetUser = await userRepo.findById(targetUserId);
      
      if (!user || !targetUser) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "One or both users not found"
        );
      }
      
      const userObjectId = user._id;
      const targetUserObjectId = targetUser._id;

      // Check if they are friends (use ObjectId)
      const areFriends = await this.friendRepository.checkIfFriends(userObjectId, targetUserObjectId);
      
      if (areFriends) {
        return FriendDto.success(
          {
            status: "FRIEND"
          },
          "Users are friends"
        );
      }

      // Check if there's a pending friend request (use ObjectId)
      const pendingRequest = await this.friendRepository.checkFriendRequestExists(userObjectId, targetUserObjectId);

      if (pendingRequest) {
        if (pendingRequest.status !== this.friendRepository.STATUS.PENDING) {
          // Request exists but not pending (rejected/cancelled)
          return FriendDto.success(
            {
              status: "NONE",
              requestId: pendingRequest._id
            },
            "A rejected/cancelled friend request exists"
          );
        }

        // Determine direction of the request (compare with ObjectId)
        if (pendingRequest.sender.toString() === userObjectId.toString()) {
          return FriendDto.success(
            {
              status: "REQUEST_SENT",
              requestId: pendingRequest._id
            },
            "Friend request sent by current user"
          );
        } else {
          return FriendDto.success(
            {
              status: "REQUEST_RECEIVED",
              requestId: pendingRequest._id
            },
            "Friend request received from target user"
          );
        }
      }

      // No relationship found
      return FriendDto.success(
        {
          status: "NONE"
        },
        "No relationship exists between users"
      );
    } catch (error) {
      console.error("Error in checkRelationship service:", error);
      return FriendDto.error(
        errorCode.CHECK_RELATIONSHIP_FAILED,
        "Failed to check relationship status",
        error.message
      );
    }
  }

  /**
   * Gửi lời mời kết bạn đến người dùng khác
   * @param {string} senderId - ID của người gửi lời mời
   * @param {string} recipientId - ID của người nhận lời mời
   * @returns {Promise<Object>} Kết quả gửi lời mời kết bạn
   */
  async sendFriendRequest(senderId, recipientId) {
    try {
      if (!senderId || !recipientId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Sender and recipient IDs are required"
        );
      }

      if (senderId === recipientId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot send friend request to yourself"
        );
      }

      // Convert UUID to ObjectId if needed
      const userRepo = new UserRepository();
      const sender = await userRepo.findById(senderId);
      const recipient = await userRepo.findById(recipientId);
      
      if (!sender || !recipient) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "One or both users not found"
        );
      }
      
      const senderObjectId = sender._id;
      const recipientObjectId = recipient._id;

      const alreadyFriends = await this.friendRepository.checkIfFriends(senderObjectId, recipientObjectId);
      if (alreadyFriends) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Users are already friends"
        );
      }

      const existingRequest = await this.friendRepository.checkFriendRequestExists(senderObjectId, recipientObjectId);
      
      if (existingRequest) {
        if (existingRequest.status === this.friendRepository.STATUS.PENDING) {
          if (existingRequest.sender.toString() === senderObjectId.toString()) {
            return FriendDto.error(
              errorCode.VALIDATION_FAILED,
              "Friend request already sent"
            );
          } else if (existingRequest.recipient.toString() === senderObjectId.toString()) {
            existingRequest.status = this.friendRepository.STATUS.ACCEPTED;
            await existingRequest.save();
            
            return FriendDto.success(
              { friendRequest: existingRequest },
              "Friend request accepted as both users sent requests"
            );
          }
          
          return FriendDto.error(
            errorCode.VALIDATION_FAILED,
            "Friend request is pending response"
          );
        }
        
        if (existingRequest.status === this.friendRepository.STATUS.REJECTED) {
          existingRequest.status = this.friendRepository.STATUS.PENDING;
          await existingRequest.save();
          
          return FriendDto.success(
            { friendRequest: existingRequest },
            "Friend request resent successfully"
          );
        }
      }

      const newFriendRequest = await this.friendRepository.createFriendRequest(senderObjectId, recipientObjectId);

      // Gửi notification cho recipient
      // sender info already fetched above
      await this.notificationService.createAndSend({
        user: recipientObjectId,
        type: "friend_request",
        content: `${sender.fullName} đã gửi lời mời kết bạn cho bạn.`,
        data: { 
          fromUserId: senderObjectId, 
          fromUserName: sender.fullName,
          fromUserAvatar: sender.profilePicture,
          requestId: newFriendRequest._id 
        }
      });

      return FriendDto.success(
        { friendRequest: newFriendRequest },
        "Friend request sent successfully"
      );
    } catch (error) {
      console.error("Error in sendFriendRequest service:", error);
      return FriendDto.error(
        errorCode.SEND_FRIEND_REQUEST_FAILED,
        "Failed to send friend request",
        error.message
      );
    }
  }

  async cancelFriendRequest(requestId, userId) {
    try {
      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Invalid request ID format"
        );
      }

      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      const friendRequest = await this.friendRepository.getFriendRequestById(requestId);

      if (!friendRequest) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "Friend request not found"
        );
      }

      // Check if the user is the sender of the request
      if (friendRequest.sender._id.toString() !== userId) {
        return FriendDto.error(
          errorCode.UNAUTHORIZED_ACCESS,
          "Only the sender can cancel this friend request"
        );
      }

      // Check if the request is in a valid state to cancel
      if (friendRequest.status !== this.friendRepository.STATUS.PENDING) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Only pending friend requests can be canceled"
        );
      }

      // Delete the friend request
      const result = await this.friendRepository.deleteFriendRequest(requestId);

      if (!result) {
        return FriendDto.error(
          errorCode.CANCEL_FRIEND_REQUEST_FAILED,
          "Failed to cancel friend request"
        );
      }

      return FriendDto.success(
        null,
        "Friend request canceled successfully"
      );
    } catch (error) {
      console.error("Error in cancelFriendRequest service:", error);
      return FriendDto.error(
        errorCode.CANCEL_FRIEND_REQUEST_FAILED,
        "Failed to cancel friend request",
        error.message
      );
    }
  }

  async acceptFriendRequest(requestId, userId) {
    try {
      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Invalid request ID format"
        );
      }

      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      const friendRequest = await this.friendRepository.getFriendRequestById(requestId);

      if (!friendRequest) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "Friend request not found"
        );
      }

      // Check if the user is the recipient of the request
      if (friendRequest.recipient._id.toString() !== userId) {
        return FriendDto.error(
          errorCode.UNAUTHORIZED_ACCESS,
          "Only the recipient can accept this friend request"
        );
      }

      // Check if the request is in a pending state
      if (friendRequest.status !== this.friendRepository.STATUS.PENDING) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "This friend request cannot be accepted"
        );
      }

      // Accept the friend request
      const result = await this.friendRepository.acceptFriendRequest(friendRequest);

      // Gửi notification cho sender
      const recipient = await this.friendRepository.userModel.findById(userId);
      await this.notificationService.createAndSend({
        user: friendRequest.sender._id,
        type: "friend_accept",
        content: `${recipient.fullName} đã chấp nhận lời mời kết bạn của bạn.`,
        data: { 
          fromUserId: userId, 
          fromUserName: recipient.fullName,
          fromUserAvatar: recipient.profilePicture,
          requestId 
        }
      });

      return FriendDto.success(
        result,
        "Friend request accepted successfully"
      );
    } catch (error) {
      console.error("Error in acceptFriendRequest service:", error);
      return FriendDto.error(
        errorCode.ACCEPT_FRIEND_REQUEST_FAILED,
        "Failed to accept friend request",
        error.message
      );
    }
  }

  async rejectFriendRequest(requestId, userId) {
    try {
      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Invalid request ID format"
        );
      }

      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      const friendRequest = await this.friendRepository.getFriendRequestById(requestId);

      if (!friendRequest) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "Friend request not found"
        );
      }

      // Check if the user is the recipient of the request
      if (friendRequest.recipient._id.toString() !== userId) {
        return FriendDto.error(
          errorCode.UNAUTHORIZED_ACCESS,
          "Only the recipient can reject this friend request"
        );
      }

      // Check if the request is in a pending state
      if (friendRequest.status !== this.friendRepository.STATUS.PENDING) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "This friend request cannot be rejected"
        );
      }

      // Reject the friend request
      const result = await this.friendRepository.rejectFriendRequest(friendRequest);

      // Gửi notification cho sender
      const recipient = await this.friendRepository.userModel.findById(userId);
      await this.notificationService.createAndSend({
        user: friendRequest.sender._id,
        type: "friend_reject",
        content: `${recipient.fullName} đã từ chối lời mời kết bạn của bạn.`,
        data: { 
          fromUserId: userId, 
          fromUserName: recipient.fullName,
          fromUserAvatar: recipient.profilePicture,
          requestId 
        }
      });

      return FriendDto.success(
        { friendRequest: result },
        "Friend request rejected successfully"
      );
    } catch (error) {
      console.error("Error in rejectFriendRequest service:", error);
      return FriendDto.error(
        errorCode.REJECT_FRIEND_REQUEST_FAILED,
        "Failed to reject friend request",
        error.message
      );
    }
  }

  async getSentFriendRequests(userId) {
    try {
      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      const sentRequests = await this.friendRepository.getSentFriendRequests(userId);

      // Format the response using DTO
      const formattedRequests = sentRequests.map(request => ({
        id: request._id,
        recipient: {
          id: request.recipient._id,
          fullName: request.recipient.fullName,
          profilePicture: request.recipient.profilePicture
        },
        status: request.status,
        createdAt: request.createdAt
      }));

      return FriendDto.success(
        { 
          requests: formattedRequests,
          totalRequests: formattedRequests.length
        },
        "Sent friend requests retrieved successfully"
      );
    } catch (error) {
      console.error("Error in getSentFriendRequests service:", error);
      return FriendDto.error(
        errorCode.GET_FRIEND_REQUESTS_FAILED,
        "Failed to retrieve sent friend requests",
        error.message
      );
    }
  }

  async getReceivedFriendRequests(userId) {
    try {
      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      const receivedRequests = await this.friendRepository.getReceivedFriendRequests(userId);

      // Format the response using DTO
      const formattedRequests = receivedRequests.map(request => ({
        id: request._id,
        sender: {
          id: request.sender._id,
          fullName: request.sender.fullName,
          profilePicture: request.sender.profilePicture,
          email: request.sender.email
        },
        status: request.status,
        createdAt: request.createdAt
      }));

      return FriendDto.success(
        { 
          requests: formattedRequests,
          totalRequests: formattedRequests.length
        },
        "Received friend requests retrieved successfully"
      );
    } catch (error) {
      console.error("Error in getReceivedFriendRequests service:", error);
      return FriendDto.error(
        errorCode.GET_FRIEND_REQUESTS_FAILED,
        "Failed to retrieve received friend requests",
        error.message
      );
    }
  }

  async unfriend(userId, friendId) {
    try {
      if (!userId || !friendId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Both user ID and friend ID are required"
        );
      }

      if (userId === friendId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot unfriend yourself"
        );
      }

      // Validate IDs format
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Invalid ID format"
        );
      }

      // Check if they are actually friends
      const areFriends = await this.friendRepository.checkIfFriends(userId, friendId);
      if (!areFriends) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "These users are not friends"
        );
      }

      // Remove the friendship
      const result = await this.friendRepository.removeFriend(userId, friendId);

      if (!result) {
        return FriendDto.error(
          errorCode.REMOVE_FRIEND_FAILED,
          "Failed to remove friend"
        );
      }

      return FriendDto.success(
        null,
        "Friend removed successfully"
      );
    } catch (error) {
      console.error("Error in unfriend service:", error);
      return FriendDto.error(
        errorCode.REMOVE_FRIEND_FAILED,
        "Failed to remove friend",
        error.message
      );
    }
  }

  async searchFriends(userId, searchQuery, page, limit) {
    try {
      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required"
        );
      }

      if (!searchQuery || searchQuery.trim().length === 0) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Search query is required"
        );
      }

      // Convert parameters to appropriate types
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      
      // Calculate skip for pagination
      const skip = (pageNumber - 1) * limitNumber;

      // Call repository to search for friends
      const { friends, totalCount } = await this.friendRepository.searchFriends(
        userId, 
        searchQuery.trim(), 
        skip, 
        limitNumber
      );

      // Format the friends data using DTO
      const formattedFriends = FriendDto.toResponseList(friends);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNumber);
      const hasNextPage = pageNumber < totalPages;
      const hasPreviousPage = pageNumber > 1;

      return FriendDto.success(
        {
          friends: formattedFriends,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            totalCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
          }
        },
        "Friends search completed successfully"
      );
    } catch (error) {
      console.error("Error in searchFriends service:", error);
      return FriendDto.error(
        errorCode.SEARCH_USERS_FAILED,
        "Failed to search for friends",
        error.message
      );
    }
  }
}

module.exports = FriendService;
