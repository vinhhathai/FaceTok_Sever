"use strict";
//----------------------------------------------------------------
const dtoResponse = require("../../../shared/helper/dtoResponse");
const { getPublicUserId } = require("../../../shared/utils/securityHelper");

/**
 * DTO for friend management functionality
 */
class FriendDto {
  /**
   * Convert friend data to response format
   * @param {Object} friend - User data (friend)
   * @returns {Object} - Formatted data
   */
  static toResponse(friend) {
    return {
      id: getPublicUserId(friend),
      fullName: friend.fullName || '',
      profilePicture: friend.profilePicture || '',
      bio: friend.bio || ''
    };
  }

  /**
   * Convert list of friends to response format
   * @param {Array} friends - List of friends
   * @returns {Array} - Formatted list
   */
  static toResponseList(friends) {
    return friends.map(friend => this.toResponse(friend));
  }

  /**
   * Create error response
   * @param {String} code - Error code
   * @param {String} message - Error message
   * @param {String} detail - Error detail
   * @returns {Object} - Error object
   */
  static error(code, message, detail) {
    return dtoResponse.error(code, message, detail);
  }

  /**
   * Create success response
   * @param {Object} data - Return data
   * @param {String} message - Success message
   * @returns {Object} - Success object
   */
  static success(data, message) {
    return dtoResponse.success(data, message);
  }
}

module.exports = FriendDto;