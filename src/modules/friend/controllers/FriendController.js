"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FriendService } = require("../services");
const { FriendDto } = require("../dtos");
const { friendRequestValidation, requestIdValidation, friendIdValidation, friendshipStatusValidation } = require("../validations/friendValidation");
const Joi = require("joi");
const { friendshipSchema, friendRequestSchema } = require("../validations");

/**
 * Controller xử lý chức năng quản lý bạn bè
 */
class FriendController {
  constructor() {
    this.friendService = new FriendService();
  }

  /**
   * Lấy danh sách bạn bè của người dùng đang đăng nhập
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getFriendsList = async (req, res) => {
    try {
      console.log("Get friends list request received");

      // Lấy ID người dùng từ JWT token (đã xác thực qua middleware checkLogin)
      const userId = req.user.id;
      
      console.log(`Getting friends for user: ${userId}`);

      // Gọi service để lấy danh sách bạn bè
      const result = await this.friendService.getFriendsList(userId);

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in getFriendsList controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.GET_FRIENDS_LIST_FAILED,
          error.message || "Lỗi khi lấy danh sách bạn bè"
        )
      );
    }
  };

  /**
   * Gửi lời mời kết bạn đến người dùng khác
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  sendFriendRequest = async (req, res) => {
    try {
      console.log("send friend request from:", req.user.id);
      
      // Validate request body
      const { error, value } = friendRequestValidation(req.body);
      
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return res.status(400).json({
          status: "error",
          code: errorCode.VALIDATION_FAILED,
          message: errorMessage,
        });
      }
      
      // Lấy ID người nhận từ request body
      const { recipientId } = value;
      
      // Gọi service để xử lý gửi lời mời kết bạn
      const result = await this.friendService.sendFriendRequest(
        req.user.id,
        recipientId
      );
      
      // Trả về kết quả
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in sendFriendRequest controller:", error);
      res.status(500).json({
        status: "error",
        code: errorCode.INTERNAL_SERVER_ERROR,
        message: "Có lỗi xảy ra khi xử lý yêu cầu",
        detail: error.message,
      });
    }
  };

  /**
   * Lấy danh sách lời mời kết bạn
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  getFriendRequests = async (req, res) => {
    try {
      console.log("Get friend requests for user:", req.user.id);
      
      // Gọi service để lấy danh sách lời mời kết bạn
      const result = await this.friendService.getFriendRequests(req.user.id);
      
      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      // Trả về kết quả thành công
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in getFriendRequests controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.GET_FRIEND_REQUESTS_FAILED,
          error.message || "Lỗi khi lấy danh sách lời mời kết bạn"
        )
      );
    }
  };

  /**
   * Chấp nhận lời mời kết bạn
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  acceptFriendRequest = async (req, res) => {
    try {
      
      // Lấy ID lời mời kết bạn từ params
      const { requestId } = req.params;
      
      // Validate requestId
      const { error } = requestIdValidation({ requestId });
      
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return res.status(400).json({
          status: "error",
          code: errorCode.VALIDATION_FAILED,
          message: errorMessage,
        });
      }
      
      // Gọi service để xử lý chấp nhận lời mời kết bạn
      const result = await this.friendService.acceptFriendRequest(
        req.user.id,
        requestId
      );
      
      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error) {
          if (result.error.code === errorCode.VALIDATION_FAILED) {
            statusCode = 400;
          } else if (result.error.code === errorCode.DATA_NOT_FOUND) {
            statusCode = 404;
          }
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      // Trả về kết quả thành công
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in acceptFriendRequest controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.ACCEPT_FRIEND_REQUEST_FAILED,
          error.message || "Lỗi khi chấp nhận lời mời kết bạn"
        )
      );
    }
  };

  /**
   * Từ chối lời mời kết bạn
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  rejectFriendRequest = async (req, res) => {
    try {
      console.log("Reject friend request by user:", req.user.id);
      console.log("Request params:", req.params);
      
      // Lấy ID lời mời kết bạn từ params
      const { requestId } = req.params;
      
      // Validate requestId
      const { error } = requestIdValidation({ requestId });
      
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        console.log("Validation error:", errorMessage);
        return res.status(400).json({
          status: "error",
          code: errorCode.VALIDATION_FAILED,
          message: errorMessage,
        });
      }
      
      // Gọi service để xử lý từ chối lời mời kết bạn
      const result = await this.friendService.rejectFriendRequest(
        req.user.id,
        requestId
      );
      
      console.log("Service result:", result);
      
      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error) {
          if (result.error.code === errorCode.VALIDATION_FAILED) {
            statusCode = 400;
          } else if (result.error.code === errorCode.DATA_NOT_FOUND) {
            statusCode = 404;
          }
        }
        
        console.log("Error in rejection, returning status:", statusCode);
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      // Trả về kết quả thành công
      console.log("Rejection successful");
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in rejectFriendRequest controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.REJECT_FRIEND_REQUEST_FAILED,
          error.message || "Lỗi khi từ chối lời mời kết bạn"
        )
      );
    }
  };

  /**
   * Hủy lời mời kết bạn đã gửi
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  cancelFriendRequest = async (req, res) => {
    try {
      console.log("Cancel friend request by user:", req.user.id);
      
      // Lấy ID lời mời kết bạn từ params
      const { requestId } = req.params;
      
      // Validate requestId
      const { error } = requestIdValidation({ requestId });
      
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return res.status(400).json({
          status: "error",
          code: errorCode.VALIDATION_FAILED,
          message: errorMessage,
        });
      }
      
      // Gọi service để xử lý hủy lời mời kết bạn
      const result = await this.friendService.cancelFriendRequest(
        req.user.id,
        requestId
      );
      
      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error) {
          if (result.error.code === errorCode.VALIDATION_FAILED) {
            statusCode = 400;
          } else if (result.error.code === errorCode.DATA_NOT_FOUND) {
            statusCode = 404;
          }
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      // Trả về kết quả thành công
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in cancelFriendRequest controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.SEND_FRIEND_REQUEST_FAILED,
          error.message || "Lỗi khi hủy lời mời kết bạn"
        )
      );
    }
  };

  /**
   * Xóa bạn bè
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  removeFriend = async (req, res) => {
    try {
      console.log("Remove friend request received");
      console.log("User ID:", req.user.id);
      console.log("Request params:", req.params);
      console.log("Request body:", req.body);
      console.log("Request URL:", req.originalUrl);
      
      // Lấy ID người bạn cần xóa từ params
      const { friendId } = req.params;
      
      console.log("Extracted friendId:", friendId);
      
      // Validate friendId
      const { error } = friendIdValidation({ friendId });
      
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return res.status(400).json({
          status: "error",
          code: errorCode.VALIDATION_FAILED,
          message: errorMessage,
        });
      }
      
      // Gọi service để xử lý xóa bạn bè
      const result = await this.friendService.removeFriend(
        req.user.id,
        friendId
      );
      
      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error) {
          if (result.error.code === errorCode.VALIDATION_FAILED) {
            statusCode = 400;
          } else if (result.error.code === errorCode.DATA_NOT_FOUND) {
            statusCode = 404;
          }
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      // Trả về kết quả thành công
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in removeFriend controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.REMOVE_FRIEND_FAILED,
          error.message || "Lỗi khi xóa bạn bè"
        )
      );
    }
  };

  /**
   * API kiểm tra trạng thái mối quan hệ bạn bè giữa hai người dùng
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async checkFriendshipStatus(req, res) {
    try {
      // Xác thực đầu vào
      const { error, value } = friendshipStatusValidation(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }
      
      const userId = req.user.id;
      const { targetUserId } = value;
      
      // Gọi service để kiểm tra trạng thái bạn bè
      const result = await this.friendService.checkFriendshipStatus(userId, targetUserId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in checkFriendshipStatus controller:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi kiểm tra trạng thái bạn bè"
      });
    }
  }

  /**
   * Lấy danh sách bạn bè của một người dùng khác thông qua ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserFriends = async (req, res) => {
    try {
      console.log("Get friends list for specific user request received");

      // Lấy ID người dùng từ params
      const { userId } = req.params;
      
      console.log(`Getting friends for user: ${userId}`);

      // Gọi service để lấy danh sách bạn bè
      const result = await this.friendService.getFriendsList(userId);

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in getUserFriends controller:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.GET_FRIENDS_LIST_FAILED,
          error.message || "Lỗi khi lấy danh sách bạn bè của người dùng"
        )
      );
    }
  };
}

// Export an instance of the controller instead of the class
module.exports = new FriendController(); 