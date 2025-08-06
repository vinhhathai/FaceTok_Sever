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
class MessageRepository {
  constructor() {
    this.messageModel = MessageModel;
    this.roomModel = RoomModel;
    this.userModel = UserModel;
    this.groupModel = GroupModel;
  }

  async renameGroup(groupId, name, currentUserId) {
    // Kiểm tra group tồn tại
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    
    // Kiểm tra user có phải là thành viên của nhóm không
    const room = await this.roomModel.findOne({ groupId: groupId });
    if (!room || !room.members.includes(currentUserId)) {
      throw new Error('You are not a member of this group');
    }
    
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

module.exports = MessageRepository;
