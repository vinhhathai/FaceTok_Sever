"use strict";
//----------------------------------------------------------------
const MessageRepository = require("../repositories/MessageRepository");
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

class MessageService {
  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async getOrCreateRoom(senderId, receiverId) {
    try {
      // Sử dụng findOneAndUpdate để tránh race condition
      // Tìm phòng hoặc tạo mới nếu không tồn tại
      const room = await this.messageRepository.findRoomByMembersOrCreate(senderId, receiverId);
      return room;
    } catch (error) {
      throw error;
    }
  }

  async createMessageInRoom(senderId, roomId, content) {
    try {
      // Kiểm tra phòng tồn tại và user có quyền gửi tin nhắn
      const room = await this.getRoomById(roomId);
      
      // Kiểm tra người dùng có trong phòng không
      if (!room.members.some(member => member._id.toString() === senderId.toString())) {
        throw new Error('User is not a member of this room');
      }
      
      // Tạo tin nhắn mới
      const message = await this.messageRepository.createMessage(senderId, roomId, content);
      
      // Cập nhật tin nhắn cuối cùng và thời gian của phòng
      await this.messageRepository.updateRoomLastMessage(roomId, message._id);
      
      return {
        message,
        room
      };
    } catch (error) {
      console.error('Error in createMessageInRoom service:', error);
      throw error;
    }
  }

  /**
   * @deprecated Sử dụng getOrCreateRoom + createMessageInRoom thay thế
   * Phương thức này được giữ lại để tương thích ngược
   */
  async sendMessage(senderId, receiverId, content) {
    try {
      // Lấy hoặc tạo phòng chat
      const room = await this.getOrCreateRoom(senderId, receiverId);
      
      // Tạo tin nhắn mới trong phòng
      const message = await this.createMessageInRoom(senderId, room._id, content);
      
      return {
        message,
        room
      };
    } catch (error) {
      console.error('Error in sendMessage service:', error);
      throw error;
    }
  }

  async getMessages(roomId, limit = 20, skip = 0) {
    try {
      const messages = await this.messageRepository.getMessagesByRoomId(roomId, limit, skip);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  async getRoom(roomId) {
    try {
      const room = await this.messageRepository.findRoomById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      return room;
    } catch (error) {
      throw error;
    }
  }

  async getRoomByUsers(userId1, userId2) {
    try {
      const room = await this.messageRepository.findRoomByMembers(userId1, userId2);
      return room;
    } catch (error) {
      throw error;
    }
  }

  async getUserRooms(userId) {
    try {
      const rooms = await this.messageRepository.getUserRooms(userId);
      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async createRoom(userId1, userId2) {
    try {
      // Kiểm tra người dùng có tồn tại không
      if (!userId1 || !userId2) {
        throw new Error('Both user IDs are required');
      }
      
      // Kiểm tra hai ID có giống nhau không
      if (userId1.toString() === userId2.toString()) {
        throw new Error('Cannot create a room with yourself');
      }
      
      console.log(`Creating room between users: ${userId1} and ${userId2}`);
      
      const room = await this.messageRepository.createRoom(userId1, userId2);
      return room;
    } catch (error) {
      console.error('Error in createRoom service:', error);
      throw error;
    }
  }

  async getRoomById(roomId) {
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      
      const room = await this.messageRepository.findRoomById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      return room;
    } catch (error) {
      console.error('Error in getRoomById service:', error);
      throw error;
    }
  }
}

// Export instance instead of class
module.exports = new MessageService();
