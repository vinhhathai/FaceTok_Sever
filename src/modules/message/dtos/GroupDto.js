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
      id: group._id,
      name: group.name,
      avatar: group.avatar,
      roomId: group.roomId,
      ownerId: group.ownerId,
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
