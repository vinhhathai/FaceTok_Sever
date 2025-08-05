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
        console.log(`Restored conversation ${room._id} for user ${senderId}`);
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

      console.log(`Creating room between users: ${userId1} and ${userId2}`);

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
}

// Export instance instead of class
module.exports = new RoomService();
