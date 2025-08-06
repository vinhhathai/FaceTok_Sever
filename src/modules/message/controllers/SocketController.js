"use strict";
//----------------------------------------------------------------
const MessageService = require("../services/MessageService");
const RoomService = require("../services/RoomService");
const GroupService = require("../services/GroupService");
const { MessageDto } = require("../dtos");
const jwt = require("jsonwebtoken");

class SocketController {
  constructor() {
    this.messageService = MessageService;
    this.roomService = RoomService;
    this.groupService = GroupService;
  }

  /**
   * Xác thực người dùng qua token
   */
  authenticateUser = async (token) => {
    try {
      // Xác thực token JWT
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      if (!decoded || !decoded.userId) {
        return {
          success: false,
          message: "Invalid token",
        };
      }

      return {
        success: true,
        userId: decoded.userId,
      };
    } catch (error) {
      console.error("JWT authentication error:", error);
      return {
        success: false,
        message: "Authentication failed",
      };
    }
  };

  revokeMessage = async (messageId, senderId) => {
    const result = await this.messageService.revokeMessage(messageId, senderId);
    return {
      success: true,
      data: result,
    };
  };

  /**
   * Tạo phòng chat giữa hai người dùng
   */
  getOrCreateRoom = async (senderId, receiverId) => {
    try {
      if (!senderId || !receiverId) {
        return {
          success: false,
          message: "User IDs are required",
        };
      }

      const room = await this.roomService.getOrCreateRoom(senderId, receiverId);
      return {
        success: true,
        data: room,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get or create room",
        error: error.message,
      };
    }
  };

  /**
   * Tạo tin nhắn trong phòng đã có
   */
  createMessageInRoom = async (senderId, roomId, content) => {
    try {
      if (!roomId || !content) {
        return {
          success: false,
          message: "Room ID and content are required",
        };
      }

      const result = await this.messageService.createMessageInRoom(
        senderId,
        roomId,
        content
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Không log lỗi block user vì đây là business logic bình thường
      if (!error.message.includes('blocked')) {
        console.error("Error in createMessageInRoom controller:", error);
      }
      return {
        success: false,
        message: error.message || "Failed to create message",
        error: error.message,
      };
    }
  };

  /**
   * Lấy danh sách phòng chat của người dùng
   */
  getUserRooms = async (userId) => {
    try {
      const rooms = await this.roomService.getUserRooms(userId);
      return {
        success: true,
        data: rooms,
      };
    } catch (error) {
      console.error("Error in getUserRooms controller:", error);
      return {
        success: false,
        message: "Failed to get rooms",
        error: error.message,
      };
    }
  };

  /**
   * Lấy danh sách tin nhắn trong phòng
   */
  getMessages = async (roomId, limit = 20, skip = 0) => {
    try {
      if (!roomId) {
        return {
          success: false,
          message: "Room ID is required",
        };
      }

      const messages = await this.messageService.getMessages(
        roomId,
        parseInt(limit) || 20,
        parseInt(skip) || 0
      );

      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      console.error("Error in getMessages controller:", error);
      return {
        success: false,
        message: "Failed to get messages",
        error: error.message,
      };
    }
  };

  /**
   * Lấy thông tin phòng theo ID
   */
  getRoomById = async (roomId) => {
    try {
      if (!roomId) {
        return {
          success: false,
          message: "Room ID is required",
        };
      }

      const room = await this.roomService.getRoomById(roomId);

      if (!room) {
        return {
          success: false,
          message: "Room not found",
        };
      }

      return {
        success: true,
        data: room,
      };
    } catch (error) {
      console.error("Error in getRoomById controller:", error);
      return {
        success: false,
        message: "Failed to get room",
        error: error.message,
      };
    }
  };

  /**
   * Đổi tên nhóm qua socket
   */
  renameGroup = async (groupId, name, currentUserId) => {
    try {
      console.log('SocketController.renameGroup called with:', { groupId, name, currentUserId });
      
      if (!groupId || !name || !currentUserId) {
        return {
          success: false,
          message: "Group ID, name and user ID are required",
        };
      }

      // Thử rename bằng groupId trước, nếu không được thì thử bằng roomId
      let group;
      try {
        console.log('Trying to rename group by groupId:', groupId);
        group = await this.groupService.renameGroup(groupId, name, currentUserId);
        console.log('Group renamed successfully by groupId:', group);
      } catch (error) {
        console.log('Error renaming by groupId:', error.message);
        if (error.message === 'Group not found') {
          // Nếu không tìm thấy group, thử tìm bằng roomId
          console.log('Trying to rename group by roomId:', groupId);
          group = await this.groupService.renameGroupByRoomId(groupId, name, currentUserId);
          console.log('Group renamed successfully by roomId:', group);
        } else {
          throw error;
        }
      }
      
      // Lấy thông tin room để gửi cho tất cả thành viên
      // Sử dụng groupId (thực chất là roomId) mà chúng ta đã có
      const room = await this.roomService.getRoomById(groupId);
      console.log('Room found:', room._id);

      // Tạo tin nhắn thông báo đổi tên nhóm
      const notificationMessage = `Nhóm đã được đổi tên thành: ${group.name}`;
      await this.createMessageInRoom(currentUserId, groupId, notificationMessage);

      return {
        success: true,
        data: { group, room },
      };
    } catch (error) {
      console.error("Error in renameGroup controller:", error);
      return {
        success: false,
        message: error.message || "Failed to rename group",
      };
    }
  };
}

module.exports = new SocketController();
