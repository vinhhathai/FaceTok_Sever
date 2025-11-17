"use strict";
//----------------------------------------------------------------
const MessageModel = require("../models/MessageModel");
const RoomModel = require("../models/RoomModel");
const GroupModel = require("../models/GroupModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.types || mongoose.Types;
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
    const updated = await this.groupModel.findByIdAndUpdate(groupId, {
      ownerId: newOwnerId,
    }, { new: true });
    return await this.groupModel.findById(updated._id);
  }

  async deleteGroup(groupId) {
    return await this.groupModel.findByIdAndUpdate(groupId, {
      isDissolved: true,
    });
  }

  async renameGroup(groupId, name) {
    const updated = await this.groupModel.findByIdAndUpdate(
      groupId,
      { name },
      { new: true }
    );
    return await this.groupModel.findById(updated._id);
  }

  async updateGroupAvatar(groupId, avatarUrl) {
    const updated = await this.groupModel.findByIdAndUpdate(
      groupId,
      { avatar: avatarUrl },
      { new: true }
    );
    return await this.groupModel.findById(updated._id);
  }

  async createGroup(name, roomId, ownerId) {
    try {
      const group = new this.groupModel({ name, roomId, ownerId });
      const saved = await group.save();
      return await this.groupModel.findById(saved._id);
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

  // Remove a member from the room that belongs to this group
  async kickMember(groupId, userId) {
    try {
      // Find the room by groupId
      const room = await this.roomModel.findOne({ groupId: groupId });
      if (!room) {
        throw new Error("Room not found for this group");
      }

      // Pull the member from the room's members array
      const updatedRoom = await this.roomModel.findByIdAndUpdate(
        room._id,
        { $pull: { members: userId } },
        { new: true }
      );

      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GroupRepository;
