"use strict";
//----------------------------------------------------------------
const MessageRepository = require("../repositories/MessageRepository");
const RoomRepository = require("../repositories/RoomRepository");
const GroupRepository = require("../repositories/GroupRepository");
const {
  errorCode,
  errorMessage,
  VALIDATION_ERRORS,
  DATA_ERRORS,
  MESSAGE_ERRORS,
  SERVER_ERRORS,
  VALIDATION_MESSAGES,
  DATA_MESSAGES,
  MESSAGE_MESSAGES,
  SERVER_MESSAGES,
} = require("../../../shared/common/error");
const { RoomDto, MessageDto } = require("../dtos");

class GroupService {
  constructor() {
    this.messageRepository = new MessageRepository();
    this.roomRepository = new RoomRepository();
    this.groupRepository = new GroupRepository();
  }

  async createGroup(name, ownerId, members = []) {
    try {
      // 1. Tạo room trước
      const room = await this.roomRepository.createRoomForGroup([
        ownerId,
        ...members,
      ]);

      // 2. Tạo group
      const group = await this.groupRepository.createGroup(
        name,
        room._id,
        ownerId
      );

      // 3. Update room với groupId
      await this.roomRepository.updateRoomWithGroupId(room._id, group._id);

      // 4. Return group với room info
      return {
        ...group.toObject(),
        roomId: room._id,
      };
    } catch (error) {
      throw error;
    }
  }

  async getGroupById(id) {
    try {
      const group = await this.groupRepository.getGroupById(id);
      return group;
    } catch (error) {
      throw error;
    }
  }
}

// Export instance instead of class
module.exports = new GroupService();
