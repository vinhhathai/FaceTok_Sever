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

  
  async changeGroupOwner(roomId, currentUserId, newOwnerId) {
    try {
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      if (!group) throw new Error("Group not found");
      if (group.ownerId.toString() !== currentUserId.toString()) {
        throw new Error("You are not the owner of this group");
      }
      const updatedGroup = await this.groupRepository.changeGroupOwner(
        group._id,
        newOwnerId
      );
      return updatedGroup;
    } catch (error) {
      throw error;
    }
  }
 

  async dissolveGroupByRoomId(roomId, currentUserId) {
    try {
      // Tìm group từ roomId
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      if (!group) throw new Error("Group not found");
      if (group.ownerId.toString() !== currentUserId.toString()) {
        throw new Error("You are not the owner of this group");
      }
      // Đánh dấu isDissolved thay vì xóa cứng
      const dissolved = await this.groupRepository.deleteGroup(group._id);
      return dissolved;
    } catch (error) {
      throw error;
    }
  }

  async renameGroupByRoomId(roomId, name, currentUserId) {
    try {
      // Tìm group bằng roomId
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      if (!group) {
        throw new Error("Group not found");
      }

      // Kiểm tra quyền thành viên
      const isMember = await this.groupRepository.checkGroupMember(
        group._id,
        currentUserId
      );
      if (!isMember) {
        throw new Error("You are not a member of this group");
      }
      // Rename group
      const updatedGroup = await this.groupRepository.renameGroup(
        group._id,
        name
      );
      // debug removed
      return updatedGroup;
    } catch (error) {
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
