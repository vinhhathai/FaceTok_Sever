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

  async renameGroup(groupId, name, currentUserId) {
    try {
      const group = await this.groupRepository.renameGroup(groupId, name, currentUserId);
      return group;
    } catch (error) {
      throw error;
    }
  }

  async renameGroupByRoomId(roomId, name, currentUserId) {
    try {
      console.log('GroupService.renameGroupByRoomId called with:', { roomId, name, currentUserId });
      
      // Tìm group bằng roomId
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      console.log('Group found by roomId:', group);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Rename group
      const updatedGroup = await this.groupRepository.renameGroup(group._id, name, currentUserId);
      console.log('Group renamed successfully:', updatedGroup);
      return updatedGroup;
    } catch (error) {
      console.error('Error in renameGroupByRoomId:', error);
      throw error;
    }
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
