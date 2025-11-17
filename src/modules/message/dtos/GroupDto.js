"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for handling chat rooms
 */
class GroupDto {
  /**
   * Transform a room to response format
   * @param {Object} room - Room object
   * @param {Object} currentUser - Current user ID
   * @returns {Object} Formatted room
   */
  static toResponseGroup(group) {
    if (!group) return null;
    return {
      id: (group._id && group._id.toString) ? group._id.toString() : String(group._id || ""),
      name: group.name,
      avatar: group.avatar,
      roomId: (group.roomId && group.roomId.toString) ? group.roomId.toString() : String(group.roomId || ""),
      ownerId: (group.ownerId && group.ownerId.toString && group.ownerId.toString()) || null,
    };
  }

  static error(code, message, detail = null) {
    return dtoResponse.error(code, message, detail);
  }

  static success(data = {}, message = "Success") {
    return dtoResponse.success(data, message);
  }
}

module.exports = GroupDto;
