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

  async sendMessage(senderId, receiverId, content) {
    try {
      // Tìm phòng chat giữa hai người dùng
      let room = await this.messageRepository.findRoomByMembers(senderId, receiverId);
      
      // Nếu phòng chưa tồn tại, tạo phòng mới
      if (!room) {
        room = await this.messageRepository.createRoom(senderId, receiverId);
      }
      
      // Tạo tin nhắn mới
      const message = await this.messageRepository.createMessage(senderId, room._id, content);
      
      // Cập nhật tin nhắn cuối cùng và thời gian của phòng
      await this.messageRepository.updateRoomLastMessage(room._id, message._id);
      
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
}

// Export instance instead of class
module.exports = new MessageService();
