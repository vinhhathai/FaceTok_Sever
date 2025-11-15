"use strict";
//----------------------------------------------------------------
const MessageModel = require("../models/MessageModel");
const RoomModel = require("../models/RoomModel");
const GroupModel = require("../models/GroupModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const UserModel = require("../../../modules/user/models/UserModel");

/**
 * Repository cho các thao tác với tin nhắn và phòng chat
 */
class GroupRepository {
  constructor() {
    this.messageModel = MessageModel;
    this.roomModel = RoomModel;
    this.userModel = UserModel;
    this.groupModel = GroupModel;
  }


  async changeGroupOwner(groupId, newOwnerId) {
    return await this.groupModel.findByIdAndUpdate(groupId, {
      ownerId: newOwnerId,
    });
  }

  async deleteGroup(groupId) {
    return await this.groupModel.findByIdAndUpdate(groupId, {
      isDissolved: true,
    });
  }

  async renameGroup(groupId, name) {
    // Repository chỉ cập nhật DB; kiểm tra hợp lệ chuyển lên service
    return await this.groupModel.findByIdAndUpdate(
      groupId,
      { name },
      { new: true }
    );
  }

  async updateGroupAvatar(groupId, avatarUrl) {
    return await this.groupModel.findByIdAndUpdate(
      groupId,
      { avatar: avatarUrl },
      { new: true }
    );
  }

  async createGroup(name, roomId, ownerId) {
    try {
      const group = new this.groupModel({ name, roomId, ownerId });
      return await group.save();
    } catch (error) {
      throw error;
    }
  }
  async checkGroupMember(groupId, userId) {
    const exists = await this.roomModel.exists({
      groupId: groupId,
      members: userId,
    });

    return !!exists;
  }
  async getGroupById(id) {
    try {
      return await this.groupModel.findById(id).populate("roomId");
    } catch (error) {
      throw error;
    }
  }

  async getGroupByRoomId(roomId) {
    try {
      // Tìm room trước, rồi lấy groupId từ room
      const room = await this.roomModel.findById(roomId);
      
      if (!room) {
        console.log(`[GroupRepository] Room not found with id: ${roomId}`);
        return null;
      }
      
      if (!room.groupId) {
        console.log(`[GroupRepository] Room ${roomId} does not have groupId. Room data:`, {
          _id: room._id,
          members: room.members?.length,
          isGroup: room.isGroup,
          groupId: room.groupId
        });
        return null;
      }

      // Tìm group bằng groupId từ room
      const group = await this.groupModel.findById(room.groupId);
      if (!group) {
        console.log(`[GroupRepository] Group not found with id: ${room.groupId}`);
      }
      return group;
    } catch (error) {
      console.error('[GroupRepository] Error in getGroupByRoomId:', error);
      throw error;
    }
  }
}

module.exports = GroupRepository;
