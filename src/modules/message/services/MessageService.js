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

class MessageService {
  constructor() {
    this.messageRepository = new MessageRepository();
    this.roomRepository = new RoomRepository();
  }

  async createMessageInRoom(senderId, roomId, content) {
    try {
      // Kiểm tra phòng tồn tại và user có quyền gửi tin nhắn
      const room = await this.roomRepository.findRoomById(roomId);

      // Kiểm tra người dùng có trong phòng không
      if (
        !room.members.some(
          (member) => member._id.toString() === senderId.toString()
        )
      ) {
        throw new Error("User is not a member of this room");
      }

      // Tạo tin nhắn mới
      const message = await this.messageRepository.createMessage(
        senderId,
        roomId,
        content
      );

      // Cập nhật tin nhắn cuối cùng và thời gian của phòng
      await this.roomRepository.updateRoomLastMessage(roomId, message._id);

      if (room.deleteBy.length > 0) {
        await this.roomRepository.backupConversation(roomId);
      }

      return {
        message,
        room,
      };
    } catch (error) {
      console.error("Error in createMessageInRoom service:", error);
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
      const room = await this.roomRepository.getOrCreateRoom(senderId, receiverId);

      // Tạo tin nhắn mới trong phòng
      const message = await this.messageRepository.createMessage(
        senderId,
        room._id,
        content
      );

      return {
        message,
        room,
      };
    } catch (error) {
      console.error("Error in sendMessage service:", error);
      throw error;
    }
  }

  async getMessages(roomId, limit = 20, skip = 0) {
    try {
      const messages = await this.messageRepository.getMessagesByRoomId(
        roomId,
        limit,
        skip
      );
      return messages;
    } catch (error) {
      throw error;
    }
  }
}

// Export instance instead of class
module.exports = new MessageService();
