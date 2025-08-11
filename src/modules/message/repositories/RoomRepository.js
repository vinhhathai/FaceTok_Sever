"use strict";
//----------------------------------------------------------------
const MessageModel = require("../models/MessageModel");
const RoomModel = require("../models/RoomModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const UserModel = require("../../user/models/UserModel");

/**
 * Repository cho các thao tác với tin nhắn và phòng chat
 */
class RoomRepository {
  constructor() {
    this.messageModel = MessageModel;
    this.roomModel = RoomModel;
    this.userModel = UserModel;
  }

  async leaveRoom(roomId, userId) {
    return await this.roomModel.findByIdAndUpdate(roomId, {
      $pull: { members: userId },
    });
  }

  async createGroupChat(userId, groupName) {
    const room = new this.roomModel({
      members: [userId],
      groupName,
    });
  }

  async deleteConversation(roomId, userId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { $push: { deleteBy: userId } },
      { new: true }
    );
  }

  async createMessage(senderId, roomId, content) {
    const message = new this.messageModel({
      senderId,
      roomId,
      content,
    });
    return await message.save();
  }

  async createRoom(userId1, userId2) {
    const room = new this.roomModel({
      members: [userId1, userId2],
    });
    return await room.save();
  }

  async createRoomForGroup(members = []) {
    const room = new this.roomModel({
      members: [...members],
    });
    return await room.save();
  }
  // Tìm phòng chat giữa hai người dùng
  async findRoomByMembers(userId1, userId2) {
    return await this.roomModel.findOne({
      members: { $all: [userId1, userId2] },
      groupId: { $exists: false },
    });
  }

  async findRoomById(roomId) {
    return await this.roomModel
      .findById(roomId)
      .populate("members", "fullName profilePicture")
      .populate("groupId");
  }

  async backupConversation(roomId) {
    return await this.roomModel
      .findByIdAndUpdate(roomId, { deleteBy: [] }, { new: true })
      .populate("members", "fullName profilePicture");
  }

  async getUserRooms(userId) {
    return await this.roomModel
      .find({
        members: userId,
        deleteBy: { $ne: userId },
      })
      .populate("members", "fullName profilePicture")
      .populate("lastMessage")
      .populate("groupId", "name avatar ownerId") // Populate group info
      .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật, mới nhất trước
  }

  /**
   * Cập nhật tin nhắn cuối cùng của phòng chat
   * @param {string} roomId - ID phòng chat
   * @param {string} messageId - ID tin nhắn cuối cùng
   * @returns {Promise<Object>} - Phòng chat đã cập nhật
   */
  async updateRoomLastMessage(roomId, messageId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { lastMessage: messageId, updatedAt: new Date() },
      { new: true }
    );
  }

  /**
   * Cập nhật groupId cho room
   * @param {string} roomId - ID phòng chat
   * @param {string} groupId - ID nhóm
   * @returns {Promise<Object>} - Room đã cập nhật
   */
  async updateRoomWithGroupId(roomId, groupId) {
    try {
      return await this.roomModel.findByIdAndUpdate(
        roomId,
        { groupId: groupId },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RoomRepository;
