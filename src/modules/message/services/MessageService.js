"use strict";
//----------------------------------------------------------------
const MessageRepository = require("../repositories/MessageRepository");
const RoomRepository = require("../repositories/RoomRepository");
const UserRepository = require("../../user/repositories/UserRepository");

class MessageService {
  constructor() {
    this.messageRepository = new MessageRepository();
    this.roomRepository = new RoomRepository();
    this.userRepository = new UserRepository();
  }

  async revokeMessage(messageId, senderId) {
    try {
      const message = await this.messageRepository.revokeMessage(
        messageId,
        senderId
      );
      return message;
    } catch (error) {
      throw error;
    }
  }

  async createMessageInRoom(senderId, roomId, content, media = []) {
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

      if (!room.groupId) {
        // Direct message: enforce mutual block policy (either side blocked => prevent sending)
        const receiverMember = room.members.find(
          (member) => member._id.toString() !== senderId.toString()
        );
        const receiverUserId = receiverMember?._id?.toString?.() || receiverMember?.toString?.() || receiverMember;
        
        const [receiver, sender] = await Promise.all([
          this.userRepository.findById(receiverUserId),
          this.userRepository.findById(senderId),
        ]);

        const receiverBlockedList = (receiver?.blockedUsers || []).map((u) => u.toString());
        const senderBlockedList = (sender?.blockedUsers || []).map((u) => u.toString());

        if (
          receiverBlockedList.includes(senderId.toString()) ||
          senderBlockedList.includes(receiverUserId?.toString?.() || String(receiverUserId))
        ) {
          throw new Error(
            "You cannot send message to this user because they have blocked you"
          );
        }
      }

      // Tạo tin nhắn mới với media
      const message = await this.messageRepository.createMessage(
        senderId,
        roomId,
        content,
        media
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
      // Không log lỗi block user vì đây là business logic bình thường
      if (!error.message.includes('blocked')) {
        console.error("Error in createMessageInRoom service:", error);
      }
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
