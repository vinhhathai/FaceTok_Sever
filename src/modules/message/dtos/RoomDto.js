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
      const ownerObjectId = room.groupId?.ownerId?.toString?.() || null;
      return {
        id: room._id?.toString?.() || String(room._id || ''),
        isGroup: true,
        groupId: {
          id: room.groupId?._id?.toString?.() || String(room.groupId?._id || ''),
          name: room.groupId?.name || room.groupName || "Group Chat",
          avatar: room.groupId?.avatar || room.groupAvatar || null,
          ownerId: ownerObjectId,
        },
        members: room.members ? room.members.map(member => ({
          id: (member._id?.toString?.() || String(member._id || '')),
          fullName: member.fullName || "",
          avatar: member.profilePicture || member.avatar || null,
        })) : [],
        // Return lastMessage instead of messages so client list can show preview
        lastMessage: room.lastMessage ? {
          id: room.lastMessage._id?.toString?.() || String(room.lastMessage._id || ''),
          content: room.lastMessage.content,
          senderId: (room.lastMessage.senderId?.toString?.() || String(room.lastMessage.senderId || '')),
          createdAt: room.lastMessage.createdAt
        } : null,
        unreadCount: (room.unreadCount && room.unreadCount.get?.(currentUser?.toString?.() || String(currentUser))) || 0,
        updatedAt: room.updatedAt
      };
    }

    // Handle direct chat
    const otherMember = room.members && room.members.length > 0 
      ? room.members.find(member => 
          member._id.toString() !== (currentUser?.toString?.() || String(currentUser))
        )
      : null;

    return {
      id: room._id?.toString?.() || String(room._id || ''),
      isGroup: false,
      participant: otherMember ? {
        id: (otherMember._id?.toString?.() || String(otherMember._id || '')),
        fullName: otherMember.fullName || '',
        avatar: otherMember.profilePicture || otherMember.avatar || null,
      } : null,
      // Return lastMessage instead of messages so client list can show preview
      lastMessage: room.lastMessage ? {
        id: room.lastMessage._id?.toString?.() || String(room.lastMessage._id || ''),
        content: room.lastMessage.content,
        senderId: (room.lastMessage.senderId?.toString?.() || String(room.lastMessage.senderId || '')),
        createdAt: room.lastMessage.createdAt
      } : null,
      unreadCount: (room.unreadCount && room.unreadCount.get?.(currentUser?.toString?.() || String(currentUser))) || 0,
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