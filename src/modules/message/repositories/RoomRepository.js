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

  async inviteToGroup(roomId, userId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId }, updatedAt: new Date() },
      { new: true }
    );
  }

  async kickOutMember(roomId, userId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId }, updatedAt: new Date() },
      { new: true }
    );
  }

  async leaveRoom(roomId, userId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId }, updatedAt: new Date() },
      { new: true }
    );
  }

  async createGroupChat(userId, groupName) {
    const newRoom = new this.roomModel({
      members: [userId],
      deleteBy: [],
      isGroup: true,
    });

    const savedRoom = await newRoom.save();
    return savedRoom;
  }

  async deleteConversation(roomId, userId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { $addToSet: { deleteBy: userId } },
      { new: true }
    );
  }

  async createMessage(senderId, roomId, content) {
    const message = new this.messageModel({ senderId, content, roomId });
    return await message.save();
  }

  async createRoom(userId1, userId2) {
    const room = new this.roomModel({
      members: [userId1, userId2],
      deleteBy: [],
      isGroup: false,
    });
    return await room.save();
  }

  async createRoomForGroup(members = []) {
    const room = new this.roomModel({ members, isGroup: true });
    return await room.save();
  }

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
      .populate({
        path: "groupId",
        select: "name avatar ownerId",
      });
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
      .populate({
        path: "groupId",
        select: "name avatar ownerId",
      })
      .sort({ updatedAt: -1 });
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

  async updateRoomWithGroupId(roomId, groupId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { groupId },
      { new: true }
    );
  }
}

module.exports = RoomRepository;
