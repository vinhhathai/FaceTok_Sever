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

      const ownerIdStr = group?.ownerId?.toString?.() || String(group?.ownerId || "");
      const currentIdStr = currentUserId?.toString?.() || String(currentUserId || "");
      const isOwner = ownerIdStr && ownerIdStr === currentIdStr;
      if (!isOwner) {
        throw new Error("You are not the owner of this group");
      }

      // newOwnerId phải là ObjectId hợp lệ
      const targetOwnerId = newOwnerId?.toString?.() || String(newOwnerId);
      const isObjectId = /^[a-f\d]{24}$/i.test(targetOwnerId);
      if (!isObjectId) {
        throw new Error("Invalid new owner ID format");
      }
      const targetUser = await this.groupRepository.userModel.findById(targetOwnerId);
      if (!targetUser) {
        throw new Error("New owner not found");
      }

      // Optional: đảm bảo new owner là thành viên nhóm
      const isMember = await this.groupRepository.checkGroupMember(group._id, targetOwnerId);
      if (!isMember) {
        throw new Error("New owner must be a current group member");
      }

      const updatedGroup = await this.groupRepository.changeGroupOwner(
        group._id,
        targetOwnerId
      );

      // Tạo tin nhắn hệ thống thông báo đổi chủ nhóm
      const actorUser = await this.groupRepository.userModel.findById(currentUserId).lean();
      const content = `${actorUser?.fullName || "Bạn"} đã chuyển quyền chủ nhóm cho ${targetUser?.fullName || "thành viên"}`;
      const systemMessage = await this.messageRepository.createMessage(
        currentUserId,
        roomId,
        content,
        []
      );
      await this.roomRepository.updateRoomLastMessage(roomId, systemMessage._id);

      // Phát realtime tin nhắn hệ thống tới phòng
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

      return updatedGroup;
    } catch (error) {
      throw error;
    }
  }
 
  async dissolveGroupByRoomId(roomId, currentUserId) {
    try {
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      if (!group) throw new Error("Group not found");

      const ownerIdStr = group?.ownerId?.toString?.() || String(group?.ownerId || "");
      const currentIdStr = currentUserId?.toString?.() || String(currentUserId || "");
      const isOwner = ownerIdStr && ownerIdStr === currentIdStr;
      if (!isOwner) {
        throw new Error("You are not the owner of this group");
      }

      const dissolved = await this.groupRepository.deleteGroup(group._id);
      return dissolved;
    } catch (error) {
      throw error;
    }
  }

  async renameGroupByRoomId(roomId, name, currentUserId) {
    try {
      console.log('[GroupService] renameGroupByRoomId called with:', { roomId, name, currentUserId });
      
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      
      if (!group) {
        console.log('[GroupService] Group not found for roomId:', roomId);
        throw new Error("Group not found or this is not a group conversation");
      }

      console.log('[GroupService] Group found:', { 
        groupId: group._id, 
        groupName: group.name,
        ownerId: group.ownerId 
      });

      // Kiểm tra quyền owner
      if (group.ownerId.toString() !== currentUserId.toString()) {
        throw new Error("Only the group owner can rename the group");
      }

      // Rename group
      const updatedGroup = await this.groupRepository.renameGroup(
        group._id,
        name
      );
      return updatedGroup;
    } catch (error) {
      throw error;
    }
  }

  async updateGroupAvatarByRoomId(roomId, currentUserId, avatarUrl) {
    try {
      const group = await this.groupRepository.getGroupByRoomId(roomId);
      if (!group) throw new Error("Group not found");

      // Cho phép bất kỳ thành viên cập nhật ảnh đại diện nhóm
      const isMember = await this.groupRepository.checkGroupMember(
        group._id,
        currentUserId
      );
      if (!isMember) {
        throw new Error("You are not a member of this group");
      }

      const updatedGroup = await this.groupRepository.updateGroupAvatar(
        group._id,
        avatarUrl
      );
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
