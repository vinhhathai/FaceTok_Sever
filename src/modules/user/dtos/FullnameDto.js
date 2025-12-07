"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");
const { getPublicUserId } = require("../../../shared/utils/securityHelper");

/**
 * DTO for handling user fullname data
 */
class FullnameDto {
  
  /**
   * Format input data for fullname update
   * @param {Object} data - Input data
   * @returns {Object} Formatted data
   */
  static toUpdateData(data) {
    return {
      fullName: data.fullName
    };
  }

  /**
   * Format response data for fullname
   * @param {Object} user - User data after update
   * @returns {Object} Formatted fullname data
   */
  static toResponse(user) {
    return {
      id: getPublicUserId(user),
      fullName: user.fullName || "",
      updatedAt: user.updatedAt,
      lastNameUpdateTime: user.lastNameUpdateTime || null
    };
  }

  /**
   * Convert response to error format
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {any} detail - Error details (optional)
   * @returns {Object} Object containing error information
   */
  static error(code, message, detail = null) {
    return dtoResponse.error(code, message, detail);
  }

  /**
   * Convert response to success format
   * @param {Object} data - Data to return
   * @param {string} message - Success message
   * @returns {Object} Object containing success data
   */
  static success(data = {}, message = "Success") {
    return dtoResponse.success(data, message);
  }
}

module.exports = FullnameDto; 