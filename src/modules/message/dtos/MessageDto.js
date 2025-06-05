"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for message handling
 */
class MessageDto {

  /**
   * Transform a single message to response format
   * @param {Object} message - Message object
   * @returns {Object} Formatted message
   */
  static toResponse(message) {
    if (!message) return null;

    return {
      id: message._id,
      senderId: message.senderId,
      content: message.content,
      roomId: message.roomId,
      createdAt: message.createdAt
    };
  }

  /**
   * Transform a list of messages to response format
   * @param {Array} messages - Array of message objects
   * @returns {Array} Array of formatted messages
   */
  static toResponseList(messages) {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map(message => this.toResponse(message));
  }
  
  /**
   * Create error response
   * @param {String} code - Error code
   * @param {String} message - Error message
   * @param {*} detail - Error details
   * @returns {Object} Error response
   */
  static error(code, message, detail = null) {
    return dtoResponse.error(code, message, detail);
  }

  /**
   * Create success response
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @returns {Object} Success response
   */
  static success(data = {}, message = "Success") {
    return dtoResponse.success(data, message);
  }
}

module.exports = MessageDto; 