"use strict";
const MessageRepository = require("../repositories/MessageRepository");
const RoomRepository = require("../repositories/RoomRepository");
const GroupRepository = require("../repositories/GroupRepository");
const SocketBus = require("../../../shared/socket/SocketBus");
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

class RoomService {
  constructor() {
    this.messageRepository = new MessageRepository();
    this.roomRepository = new RoomRepository();
    this.groupRepository = new GroupRepository();
  }

  async getUserRooms(userId) {
    try {
      // Delegate to repository which handles population and sorting
      const rooms = await this.roomRepository.getUserRooms(userId);
      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async getRoom(roomId) {
    try {
      const room = await this.roomRepository.findRoomById(roomId);
      if (!room) {
        throw new Error("Room not found");
      }
      return room;
    } catch (error) {
      throw error;
    }
  }

  async getRoomByUsers(currentUserId, otherUserId) {
    try {
      const room = await this.roomRepository.findRoomByMembers(currentUserId, otherUserId);
      return room || null;
    } catch (error) {
      throw error;
    }
  }

  async getOrCreateRoom(currentUserId, targetUserId) {
    try {
      let room = await this.roomRepository.findRoomByMembers(currentUserId, targetUserId);
      if (!room) {
        room = await this.roomRepository.createRoom(currentUserId, targetUserId);
      }
      return room;
    } catch (error) {
      throw error;
    }
  }

  async kickOutMember(roomId, currentUserId, targetUserId) {
    try {
      const room = await this.roomRepository.findRoomById(roomId);
      if (!room || !room.groupId) {
        throw new Error("This is not a group room or room not found");
      }

      const group = await this.groupRepository.getGroupById(room.groupId._id || room.groupId);
      if (!group) throw new Error("Group not found");

      const ownerIdStr = group?.ownerId?.toString?.() || String(group?.ownerId || "");
      const currentIdStr = currentUserId?.toString?.() || String(currentUserId || "");
      const isOwner = ownerIdStr && ownerIdStr === currentIdStr;
      if (!isOwner) {
        throw new Error("You are not the group owner");
      }

      const targetIdStr = targetUserId?.toString?.() || String(targetUserId);
      const isObjectId = /^[a-f\d]{24}$/i.test(targetIdStr);
      if (!isObjectId) throw new Error("Invalid target user id format");

      const isMember = await this.groupRepository.checkGroupMember(group._id, targetIdStr);
      if (!isMember) throw new Error("Target user is not a member of this group");

      const result = await this.groupRepository.kickMember(group._id, targetIdStr);

      const actorUser = await this.groupRepository.userModel.findById(currentUserId).lean();
      const targetUser = await this.groupRepository.userModel.findById(targetIdStr).lean();
      const content = `${actorUser?.fullName || "Chủ nhóm"} đã xóa ${targetUser?.fullName || "thành viên"} khỏi nhóm`;
      const systemMessage = await this.messageRepository.createMessage(
        currentUserId,
        roomId,
        content,
        []
      );
      await this.roomRepository.updateRoomLastMessage(roomId, systemMessage._id);

      const populatedRoom = await this.roomRepository.findRoomById(roomId);
      const sender = populatedRoom.members.find(
        (member) => (member._id?.toString?.() || member?.toString?.()) === (currentUserId?.toString?.() || String(currentUserId))
      );
      const messageData = {
        _id: (systemMessage._id?.toString?.() || String(systemMessage._id || '')),
        senderId: sender
          ? {
              _id: (sender._id?.toString?.() || String(sender._id || '')),
              fullName: sender.fullName,
              profilePicture: sender.profilePicture,
              avatar: sender.avatar || null,
            }
          : (systemMessage.senderId?.toString?.() || String(systemMessage.senderId || '')),
        content: systemMessage.content,
        media: [],
        roomId: (systemMessage.roomId?.toString?.() || String(systemMessage.roomId || '')),
        createdAt: systemMessage.createdAt,
        sender: sender
          ? {
              id: (sender._id?.toString?.() || String(sender._id || '')),
              fullName: sender.fullName,
              profilePicture: sender.profilePicture,
            }
          : undefined,
      };
      try {
        SocketBus.emitToRoom(roomId, "message_received", messageData);
      } catch {}

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoomService();
