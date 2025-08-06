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
}

module.exports = MessageRepository;
