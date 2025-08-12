"use strict";
//----------------------------------------------------------------
const MessageRepository = require("../repositories/MessageRepository");
const RoomRepository = require("../repositories/RoomRepository");
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
  }

  async kickOutMember(roomId, userId, kickOutUserId) {
    try {
      const room = await this.roomRepository.findRoomById(roomId);
      // Chỉ áp dụng cho phòng nhóm có groupId và có owner
      const ownerId = room?.groupId?.ownerId;
      if (!ownerId) {
        throw new Error("This room is not a group or group has no owner");
      }
      if (ownerId.toString() !== userId.toString()) {
        throw new Error("You are not the owner of this group");
      }

      const newRoom = await this.roomRepository.kickOutMember(roomId, kickOutUserId);

      return newRoom;
    } catch (error) {
      throw error;
    }
  }


  async deleteConversation(roomId, userId) {
    try {
      const room = await this.roomRepository.deleteConversation(roomId, userId);
      return room;
    } catch (error) {
      throw error;
    }
  }

  
  async getOrCreateRoom(senderId, receiverId) {
    try {
      // Tìm phòng hoặc tạo mới nếu không tồn tại
      const room = await this.roomRepository.findRoomByMembers(
        senderId,
        receiverId
      );
      if (!room) {
        const newRoom = await this.roomRepository.createRoom(
          senderId,
          receiverId
        );
        return newRoom;
      }
      
      // Kiểm tra xem room có bị xóa bởi sender không
      if (room.deleteBy && room.deleteBy.includes(senderId)) {
        // Khôi phục conversation cho sender
        await this.roomRepository.backupConversation(room._id);
      // debug removed
      }
      
      return room;
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

  async getRoomByUsers(userId1, userId2) {
    try {
      const room = await this.roomRepository.findRoomByMembers(
        userId1,
        userId2
      );
      return room;
    } catch (error) {
      throw error;
    }
  }

  async getUserRooms(userId) {
    try {
      const rooms = await this.roomRepository.getUserRooms(userId);
      
      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async createRoom(userId1, userId2) {
    try {
      // Kiểm tra người dùng có tồn tại không
      if (!userId1 || !userId2) {
        throw new Error("Both user IDs are required");
      }

      // Kiểm tra hai ID có giống nhau không
      if (userId1.toString() === userId2.toString()) {
        throw new Error("Cannot create a room with yourself");
      }

      // debug removed

      const room = await this.roomRepository.createRoom(userId1, userId2);
      return room;
    } catch (error) {
      console.error("Error in createRoom service:", error);
      throw error;
    }
  }

  async getRoomById(roomId) {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      const room = await this.roomRepository.findRoomById(roomId);
      if (!room) {
        throw new Error("Room not found");
      }
      return room;
    } catch (error) {
      console.error("Error in getRoomById service:", error);
      throw error;
    }
  }

  async leaveGroup(roomId, userId) {
    try {
      const room = await this.roomRepository.findRoomById(roomId);
      if (!room) throw new Error("Room not found");
      // Kiểm tra là thành viên
      const isMember = room.members.some(
        (m) => m._id.toString() === userId.toString()
      );
      if (!isMember) throw new Error("You are not a member of this group");

      // Ngăn owner tự rời nếu chưa chuyển quyền
      if (room.groupId && room.groupId.ownerId?.toString?.() === userId.toString()) {
        throw new Error("Owner cannot leave the group. Transfer ownership first");
      }

      await this.roomRepository.leaveRoom(roomId, userId);
      return await this.roomRepository.findRoomById(roomId);
    } catch (error) {
      throw error;
    }
  }
}

// Export instance instead of class
module.exports = new RoomService();
