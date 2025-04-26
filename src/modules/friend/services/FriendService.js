"use strict";
//----------------------------------------------------------------
const FriendRepository = require("../repositories/FriendRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FriendDto } = require("../dtos");
const FriendRequestModel = require("../models/FriendRequestModel");

/**
 * Service xử lý chức năng quản lý bạn bè
 */
class FriendService {
  constructor() {
    this.friendRepository = new FriendRepository();
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
          "User ID không được để trống"
        );
      }

      const friends = await this.friendRepository.getFriendsList(userId);

      // Đếm tổng số bạn bè
      const totalFriends = friends.length;

      // Format dữ liệu trả về bằng DTO
      const formattedFriends = FriendDto.toResponseList(friends);

      // Trả về kết quả thành công
      return FriendDto.success(
        {
          friends: formattedFriends,
          totalFriends: totalFriends,
        },
        "Lấy danh sách bạn bè thành công"
      );
    } catch (error) {
      console.error("Error in getFriendsList service:", error);
      return FriendDto.error(
        errorCode.GET_FRIENDS_LIST_FAILED,
        "Lỗi khi lấy danh sách bạn bè",
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
      // Kiểm tra dữ liệu đầu vào
      if (!senderId || !recipientId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "ID người gửi và người nhận không được để trống"
        );
      }

      // Kiểm tra xem người gửi có tự gửi lời mời kết bạn cho chính mình không
      if (senderId === recipientId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Không thể gửi lời mời kết bạn cho chính mình"
        );
      }

      // Kiểm tra xem hai người dùng đã là bạn bè chưa
      const alreadyFriends = await this.friendRepository.checkIfFriends(senderId, recipientId);
      if (alreadyFriends) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Hai người dùng đã là bạn bè"
        );
      }

      // Kiểm tra xem đã có lời mời kết bạn giữa hai người dùng chưa
      const existingRequest = await this.friendRepository.checkFriendRequestExists(senderId, recipientId);
      
      if (existingRequest) {
        // Nếu đã có lời mời và trạng thái là pending
        if (existingRequest.status === this.friendRepository.STATUS.PENDING) {
          // Nếu người gửi hiện tại là người đã nhận lời mời trước đó
          if (existingRequest.sender.toString() === senderId.toString()) {
            return FriendDto.error(
              errorCode.VALIDATION_FAILED,
              "Lời mời kết bạn đã được gửi trước đó"
            );
          } else if (existingRequest.recipient.toString() === senderId) {
            // Trường hợp này là lời mời ngược lại - tự động chấp nhận
            existingRequest.status = this.friendRepository.STATUS.ACCEPTED;
            await existingRequest.save();
            
            return FriendDto.success(
              { friendRequest: existingRequest },
              "Lời mời kết bạn đã được chấp nhận do cả hai đều gửi lời mời"
            );
          }
          
          // Nếu lời mời đã tồn tại và người gửi giống nhau
          return FriendDto.error(
            errorCode.VALIDATION_FAILED,
            "Lời mời kết bạn đã được gửi trước đó và đang chờ phản hồi"
          );
        }
        
        // Nếu đã có lời mời và trạng thái là rejected
        if (existingRequest.status === this.friendRepository.STATUS.REJECTED) {
          // Cập nhật lại trạng thái thành pending
          existingRequest.status = this.friendRepository.STATUS.PENDING;
          await existingRequest.save();
          
          return FriendDto.success(
            { friendRequest: existingRequest },
            "Lời mời kết bạn đã được gửi lại"
          );
        }
      }

      // Tạo lời mời kết bạn mới
      const newFriendRequest = await this.friendRepository.createFriendRequest(senderId, recipientId);

      // Trả về kết quả thành công
      return FriendDto.success(
        { friendRequest: newFriendRequest },
        "Gửi lời mời kết bạn thành công"
      );
    } catch (error) {
      console.error("Error in sendFriendRequest service:", error);
      return FriendDto.error(
        errorCode.SEND_FRIEND_REQUEST_FAILED,
        "Lỗi khi gửi lời mời kết bạn",
        error.message
      );
    }
  }

  /**
   * Lấy danh sách lời mời kết bạn của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Kết quả danh sách lời mời kết bạn
   */
  async getFriendRequests(userId) {
    try {
      if (!userId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID không được để trống"
        );
      }

      // Lấy danh sách lời mời kết bạn mà người dùng nhận được
      const receivedRequests = await this.friendRepository.getReceivedFriendRequests(userId);
      
      // Lấy danh sách lời mời kết bạn mà người dùng đã gửi
      const sentRequests = await this.friendRepository.getSentFriendRequests(userId);

      return FriendDto.success(
        {
          received: receivedRequests,
          sent: sentRequests,
          totalReceived: receivedRequests.length,
          totalSent: sentRequests.length
        },
        "Lấy danh sách lời mời kết bạn thành công"
      );
    } catch (error) {
      console.error("Error in getFriendRequests service:", error);
      return FriendDto.error(
        errorCode.GET_FRIEND_REQUESTS_FAILED,
        "Lỗi khi lấy danh sách lời mời kết bạn",
        error.message
      );
    }
  }

  /**
   * Chấp nhận lời mời kết bạn
   * @param {string} userId - ID của người dùng chấp nhận lời mời
   * @param {string} requestId - ID của lời mời kết bạn
   * @returns {Promise<Object>} Kết quả chấp nhận lời mời kết bạn
   */
  async acceptFriendRequest(userId, requestId) {
    try {
      if (!userId || !requestId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID và Request ID không được để trống"
        );
      }

      // Kiểm tra xem lời mời kết bạn có tồn tại không
      const friendRequest = await this.friendRepository.getFriendRequestById(requestId);
      
      if (!friendRequest) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "Không tìm thấy lời mời kết bạn"
        );
      }

      // Kiểm tra trạng thái của lời mời
      if (friendRequest.status !== this.friendRepository.STATUS.PENDING) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Lời mời kết bạn này đã được xử lý trước đó"
        );
      }

      // Chấp nhận lời mời kết bạn
      const result = await this.friendRepository.acceptFriendRequest(friendRequest);

      return FriendDto.success(
        { 
          friendRequest: result.friendRequest,
          friend: result.friend
        },
        "Chấp nhận lời mời kết bạn thành công"
      );
    } catch (error) {
      console.error("Error in acceptFriendRequest service:", error);
      return FriendDto.error(
        errorCode.ACCEPT_FRIEND_REQUEST_FAILED,
        "Lỗi khi chấp nhận lời mời kết bạn",
        error.message
      );
    }
  }

  /**
   * Từ chối lời mời kết bạn
   * @param {string} userId - ID của người dùng từ chối lời mời
   * @param {string} requestId - ID của lời mời kết bạn
   * @returns {Promise<Object>} Kết quả từ chối lời mời kết bạn
   */
  async rejectFriendRequest(userId, requestId) {
    try {
      
      if (!userId || !requestId) {
        console.log("Validation failed - missing userId or requestId");
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID và Request ID không được để trống"
        );
      }

      // Kiểm tra xem lời mời kết bạn có tồn tại không
      const friendRequest = await this.friendRepository.getFriendRequestById(requestId);
      
      if (!friendRequest) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "Không tìm thấy lời mời kết bạn"
        );
      }

      

      // Kiểm tra trạng thái của lời mời
      const isPending = friendRequest.status === this.friendRepository.STATUS.PENDING;
      
      if (!isPending) {
        console.log("Request already processed");
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Lời mời kết bạn này đã được xử lý trước đó"
        );
      }

      // Từ chối lời mời kết bạn
      const rejectedRequest = await this.friendRepository.rejectFriendRequest(friendRequest);

      return FriendDto.success(
        { friendRequest: rejectedRequest },
        "Từ chối lời mời kết bạn thành công"
      );
    } catch (error) {
      console.error("Error in rejectFriendRequest service:", error);
      return FriendDto.error(
        errorCode.REJECT_FRIEND_REQUEST_FAILED,
        "Lỗi khi từ chối lời mời kết bạn",
        error.message
      );
    }
  }

  /**
   * Hủy lời mời kết bạn đã gửi
   * @param {string} userId - ID của người dùng hủy lời mời
   * @param {string} requestId - ID của lời mời kết bạn
   * @returns {Promise<Object>} Kết quả hủy lời mời kết bạn
   */
  async cancelFriendRequest(userId, requestId) {
    try {
      if (!userId || !requestId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID và Request ID không được để trống"
        );
      }

      // Kiểm tra xem lời mời kết bạn có tồn tại không
      const friendRequest = await this.friendRepository.getFriendRequestById(requestId);
      
      if (!friendRequest) {
        return FriendDto.error(
          errorCode.DATA_NOT_FOUND,
          "Không tìm thấy lời mời kết bạn"
        );
      }


      // Kiểm tra trạng thái của lời mời
      if (friendRequest.status !== this.friendRepository.STATUS.PENDING) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Lời mời kết bạn này đã được xử lý trước đó"
        );
      }

      // Xóa lời mời kết bạn
      await this.friendRepository.deleteFriendRequest(requestId);

      return FriendDto.success(
        { message: "Lời mời kết bạn đã được hủy" },
        "Hủy lời mời kết bạn thành công"
      );
    } catch (error) {
      console.error("Error in cancelFriendRequest service:", error);
      return FriendDto.error(
        errorCode.SEND_FRIEND_REQUEST_FAILED,
        "Lỗi khi hủy lời mời kết bạn",
        error.message
      );
    }
  }

  /**
   * Xóa bạn bè
   * @param {string} userId - ID của người dùng
   * @param {string} friendId - ID của người bạn cần xóa
   * @returns {Promise<Object>} Kết quả xóa bạn bè
   */
  async removeFriend(userId, friendId) {
    try {
      if (!userId || !friendId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID và Friend ID không được để trống"
        );
      }

      // Kiểm tra xem hai người có phải là bạn bè không
      const alreadyFriends = await this.friendRepository.checkIfFriends(userId, friendId);
      console.log(userId, friendId)
      
      if (!alreadyFriends) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "Người dùng này không phải là bạn bè của bạn"
        );
      }

      // Xóa mối quan hệ bạn bè
      await this.friendRepository.removeFriend(userId, friendId);

      return FriendDto.success(
        { 
          message: "Đã xóa khỏi danh sách bạn bè",
          friendId: friendId
        },
        "Xóa bạn bè thành công"
      );
    } catch (error) {
      console.error("Error in removeFriend service:", error);
      return FriendDto.error(
        errorCode.REMOVE_FRIEND_FAILED,
        "Lỗi khi xóa bạn bè",
        error.message
      );
    }
  }

  /**
   * Kiểm tra trạng thái mối quan hệ bạn bè giữa hai người dùng
   * @param {string} userId - ID của người dùng đang đăng nhập
   * @param {string} targetUserId - ID của người dùng cần kiểm tra
   * @returns {Promise<Object>} Trạng thái mối quan hệ bạn bè
   */
  async checkFriendshipStatus(userId, targetUserId) {
    try {
      if (!userId || !targetUserId) {
        return FriendDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID và Target User ID không được để trống"
        );
      }

      // Kiểm tra xem hai người có phải là một người không
      if (userId === targetUserId) {
        return FriendDto.success(
          { status: "self" },
          "Đây là chính người dùng"
        );
      }

      // Kiểm tra xem hai người có phải là bạn bè không
      const areFriends = await this.friendRepository.checkIfFriends(userId, targetUserId);
      
      if (areFriends) {
        return FriendDto.success(
          { status: "friends" },
          "Hai người dùng là bạn bè"
        );
      }

      // Kiểm tra xem có lời mời kết bạn nào giữa hai người không
      const friendRequest = await this.friendRepository.checkFriendRequestExists(userId, targetUserId);
      
      if (friendRequest) {
        if (friendRequest.status === this.friendRepository.STATUS.PENDING) {
          if (friendRequest.sender.toString() === userId) {
            return FriendDto.success(
              { 
                status: "pending_sent",
                requestId: friendRequest._id
              },
              "Đã gửi lời mời kết bạn và đang chờ phản hồi"
            );
          } else {
            return FriendDto.success(
              { 
                status: "pending_received",
                requestId: friendRequest._id
              },
              "Đã nhận lời mời kết bạn và đang chờ phản hồi"
            );
          }
        } else if (friendRequest.status === this.friendRepository.STATUS.REJECTED) {
          return FriendDto.success(
            { 
              status: "rejected",
              requestId: friendRequest._id
            },
            "Lời mời kết bạn đã bị từ chối"
          );
        }
      }

      // Nếu không có mối quan hệ gì
      return FriendDto.success(
        { status: "none" },
        "Không có mối quan hệ bạn bè"
      );
    } catch (error) {
      console.error("Error in checkFriendshipStatus service:", error);
      return FriendDto.error(
        errorCode.CHECK_FRIENDSHIP_STATUS_FAILED,
        "Lỗi khi kiểm tra trạng thái bạn bè",
        error.message
      );
    }
  }
}

module.exports = FriendService;
