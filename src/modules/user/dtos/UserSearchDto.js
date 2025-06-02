"use strict";
//----------------------------------------------------------------
const dtoResponse = require("../../../shared/helper/dtoResponse");

/**
 * DTO for user search functionality
 */
class UserSearchDto {
  /**
   * Convert user data to search result response format
   * @param {Object} user - User data
   * @returns {Object} - Formatted data
   */
  static toResponse(user) {
    return {
      id: user._id || user.id,
      fullName: user.fullName || '',
      profilePicture: user.profilePicture || '',
      bio: user.bio || '',
    };
  }

  /**
   * Convert list of users to search result response format
   * @param {Array} users - List of users
   * @returns {Array} - Formatted list
   */
  static toResponseList(users) {
    return users.map(user => this.toResponse(user));
  }

  /**
   * Create error response
   * @param {String} code - Error code
   * @param {String} message - Error message
   * @param {String} detail - Error details
   * @returns {Object} - Error object
   */
  static error(code, message, detail) {
    return dtoResponse.error(code, message, detail);
  }

  /**
   * Create success response
   * @param {Object} data - Response data
   * @param {String} message - Response message
   * @returns {Object} - Success object
   */
  static success(data, message) {
    return dtoResponse.success(data, message);
  }
}

module.exports = UserSearchDto; 