"use strict";
//----------------------------------------------------------------
const MessageModel = require("../models/MessageModel");
const RoomModel = require("../models/RoomModel");
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
  }

  async revokeMessage(messageId, senderId) {
    return await this.messageModel.findOneAndUpdate(
      {
        _id: messageId,
        senderId: senderId,
      },
      { isRevoked: true },
      { new: true }
    );
  }

  async createMessage(senderId, roomId, content, media = []) {
    const message = new this.messageModel({
      senderId,
      roomId,
      content,
      media,
    });

    return await message.save();
  }

  async getMessagesByRoomId(roomId, limit = 20, skip = 0) {
    return await this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian, mới nhất trước
      .skip(skip)
      .limit(limit)
      .populate("senderId", "fullName profilePicture")
      .lean();
  }
}

module.exports = MessageRepository;
