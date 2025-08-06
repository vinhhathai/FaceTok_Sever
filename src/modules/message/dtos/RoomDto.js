"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for handling chat rooms
 */
class RoomDto {

  /**
   * Transform a room to response format
   * @param {Object} room - Room object
   * @param {Object} currentUser - Current user ID
   * @returns {Object} Formatted room
   */
  static toResponseRoom(room, currentUser) {
    if (!room) return null;

    // Handle group chat
    if (room.groupId) {
      return {
        id: room._id,
        isGroup: true,
        groupName: room.groupName || 'Group Chat',
        groupAvatar: room.groupAvatar || null,
        members: room.members ? room.members.map(member => ({
          id: member._id,
          fullName: member.fullName || '',
          avatar: member.avatar || null,
        })) : [],
        messages: room.messages ? {
          id: room.messages._id,
          content: room.messages.content,
          senderId: room.messages.senderId,
          createdAt: room.messages.createdAt
        } : null,
        unreadCount: room.unreadCount && room.unreadCount.get(currentUser.toString()) || 0,
        updatedAt: room.updatedAt
      };
    }

    // Handle direct chat
    // Filter to find the other participant (excluding the current user)
    const otherMember = room.members && room.members.length > 0 
      ? room.members.find(member => 
          member._id.toString() !== currentUser.toString()
        )
      : null;

    return {
      id: room._id,
      isGroup: false,
      participant: otherMember ? {
        id: otherMember._id,
        fullName: otherMember.fullName || '',
        avatar: otherMember.avatar || null,
      } : null,
      messages: room.messages ? {
        id: room.messages._id,
        content: room.messages.content,
        senderId: room.messages.senderId,
        createdAt: room.messages.createdAt
      } : null,
      unreadCount: room.unreadCount && room.unreadCount.get(currentUser.toString()) || 0,
      updatedAt: room.updatedAt
    };
  }

  /**
   * Transform a list of rooms to response format
   * @param {Array} rooms - Array of room objects
   * @param {String} currentUserId - Current user ID
   * @returns {Array} Array of formatted rooms
   */
  static toResponseList(rooms, currentUserId) {
    if (!rooms || !Array.isArray(rooms)) return [];
    
    return rooms.map(room => this.toResponseRoom(room, currentUserId));
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

module.exports = RoomDto; 