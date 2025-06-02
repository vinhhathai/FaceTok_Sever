"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FriendService } = require("../services");
const { FriendDto } = require("../dtos");
const { friendRequestValidation, requestIdValidation, friendIdValidation, friendshipStatusValidation, searchQueryValidation } = require("../validations/friendValidation");
const Joi = require("joi");
const { friendshipSchema, friendRequestSchema } = require("../validations");

/**
 * Controller for managing friend functionalities
 */
class FriendController {
  constructor() {
    this.friendService = new FriendService();
  }

  /**
   * Get the list of friends for the logged in user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getFriendsList = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const result = await this.friendService.getFriendsList(userId);

      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getFriendsList:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.GET_FRIENDS_LIST_FAILED,
          "Failed to retrieve friends list"
        )
      );
    }
  };

  /**
   * Check relationship status between the current user and another user
   * @param {Object} req - Express request object with targetUserId param
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  checkRelationship = async (req, res) => {
    try {
      const { error, value } = friendshipStatusValidation({ targetUserId: req.params.targetUserId });
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { targetUserId } = value;
      const userId = req.user.id;
      
      const result = await this.friendService.checkRelationship(userId, targetUserId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in checkRelationship:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.CHECK_RELATIONSHIP_FAILED,
          "Failed to check relationship status"
        )
      );
    }
  };

  /**
   * Send a friend request to another user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  sendFriendRequest = async (req, res) => {
    try {
      const { error, value } = friendRequestValidation(req.body);
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { recipientId } = value;
      const senderId = req.user.id;
      
      const result = await this.friendService.sendFriendRequest(senderId, recipientId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in sendFriendRequest:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.SEND_FRIEND_REQUEST_FAILED,
          "Failed to process friend request"
        )
      );
    }
  };

  cancelFriendRequest = async (req, res) => {
    try {
      const { error, value } = requestIdValidation(req.body);
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { requestId } = value;
      const userId = req.user.id;
      
      const result = await this.friendService.cancelFriendRequest(requestId, userId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in cancelFriendRequest:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.CANCEL_FRIEND_REQUEST_FAILED,
          "Failed to cancel friend request"
        )
      );
    }
  };

  acceptFriendRequest = async (req, res) => {
    try {
      const { error, value } = requestIdValidation(req.body);
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { requestId } = value;
      const userId = req.user.id;
      
      const result = await this.friendService.acceptFriendRequest(requestId, userId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 
                          result.error?.code === errorCode.DATA_NOT_FOUND ? 404 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in acceptFriendRequest:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.ACCEPT_FRIEND_REQUEST_FAILED,
          "Failed to accept friend request"
        )
      );
    }
  };

  rejectFriendRequest = async (req, res) => {
    try {
      const { error, value } = requestIdValidation(req.body);
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { requestId } = value;
      const userId = req.user.id;
      
      const result = await this.friendService.rejectFriendRequest(requestId, userId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 
                          result.error?.code === errorCode.DATA_NOT_FOUND ? 404 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in rejectFriendRequest:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.REJECT_FRIEND_REQUEST_FAILED,
          "Failed to reject friend request"
        )
      );
    }
  };

  getSentFriendRequests = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const result = await this.friendService.getSentFriendRequests(userId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getSentFriendRequests:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.GET_FRIEND_REQUESTS_FAILED,
          "Failed to retrieve sent friend requests"
        )
      );
    }
  };

  getReceivedFriendRequests = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const result = await this.friendService.getReceivedFriendRequests(userId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getReceivedFriendRequests:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.GET_FRIEND_REQUESTS_FAILED,
          "Failed to retrieve received friend requests"
        )
      );
    }
  };

  unfriend = async (req, res) => {
    try {
      const { error, value } = friendIdValidation(req.body);
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { friendId } = value;
      const userId = req.user.id;
      
      const result = await this.friendService.unfriend(userId, friendId);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 
                          result.error?.code === errorCode.DATA_NOT_FOUND ? 404 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in unfriend:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.REMOVE_FRIEND_FAILED,
          "Failed to remove friend"
        )
      );
    }
  };

  searchFriends = async (req, res) => {
    try {
      const { error, value } = searchQueryValidation(req.query);
      
      if (error) {
        return res.status(400).json(
          FriendDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      const { query, page = 1, limit = 10 } = value;
      const userId = req.user.id;
      
      const result = await this.friendService.searchFriends(userId, query, page, limit);
      
      if (!result.success) {
        const statusCode = result.error?.code === errorCode.VALIDATION_FAILED ? 400 : 500;
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in searchFriends:", error);
      return res.status(500).json(
        FriendDto.error(
          errorCode.SEARCH_USERS_FAILED,
          "Failed to search for friends"
        )
      );
    }
  };
}

// Export the class instead of an instance
module.exports = FriendController; 