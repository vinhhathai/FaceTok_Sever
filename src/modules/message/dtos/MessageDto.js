"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for message handling
 */
class MessageDto {

  static toResponse(message) {
    if (!message) return null;

    const idStr = (message._id && message._id.toString)
      ? message._id.toString()
      : String(message._id || "");

    const roomIdStr = (message.roomId && message.roomId.toString)
      ? message.roomId.toString()
      : String(message.roomId || "");

    // Preserve populated sender object when available; otherwise fallback to string
    let senderVal = null;
    if (message.senderId && typeof message.senderId === 'object' && message.senderId !== null) {
      senderVal = {
        _id: (message.senderId._id && message.senderId._id.toString)
          ? message.senderId._id.toString()
          : String(message.senderId._id || ""),
        fullName: message.senderId.fullName || "",
        profilePicture: message.senderId.profilePicture || null,
        avatar: message.senderId.avatar || null,
      };
    } else {
      senderVal = (message.senderId && message.senderId.toString)
        ? message.senderId.toString()
        : String(message.senderId || "");
    }

    return {
      _id: idStr,
      senderId: senderVal,
      content: message.content,
      media: Array.isArray(message.media) ? message.media : [],
      isRevoked: message.isRevoked === true,
      roomId: roomIdStr,
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