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
      if (!room || !room.groupId) {
        return null;
      }

      // Tìm group bằng groupId từ room
      return await this.groupModel.findById(room.groupId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GroupRepository;
