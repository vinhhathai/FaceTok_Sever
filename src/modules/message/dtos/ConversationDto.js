"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for conversation handling
 */
class ConversationDto {

  /**
   * Transform a single conversation to response format
   * @param {Object} conversation - Conversation object
   * @param {Object} currentUser - Current user object
   * @returns {Object} Formatted conversation
   */
  static toResponse(conversation, currentUser) {
    if (!conversation) return null;

    // Extract the other user from participants (excluding current user)
    const otherParticipant = conversation.participants && conversation.participants.length > 0 
      ? conversation.participants[0] 
      : null;

    return {
      id: conversation._id,
      participant: otherParticipant ? {
        id: otherParticipant._id,
        firstName: otherParticipant.firstName || '',
        lastName: otherParticipant.lastName || '',
        avatar: otherParticipant.avatar || null,
        isOnline: otherParticipant.isOnline || false,
        lastActive: otherParticipant.lastActive || null
      } : null,
      lastMessage: conversation.lastMessage ? {
        id: conversation.lastMessage._id,
        text: conversation.lastMessage.text,
        sentAt: conversation.lastMessage.sentAt,
        isRead: conversation.lastMessage.isRead
      } : null,
      unreadCount: conversation.unreadCount && conversation.unreadCount.get(currentUser.toString()) || 0,
      lastActivity: conversation.lastActivity
    };
  }

  /**
   * Transform a list of conversations to response format
   * @param {Array} conversations - Array of conversation objects
   * @param {String} currentUserId - Current user ID
   * @returns {Array} Array of formatted conversations
   */
  static toResponseList(conversations, currentUserId) {
    if (!conversations || !Array.isArray(conversations)) return [];
    
    return conversations.map(conversation => this.toResponse(conversation, currentUserId));
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

module.exports = ConversationDto; 