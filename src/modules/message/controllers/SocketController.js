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
      if (!error.message.includes("blocked")) {
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

  leaveGroup = async (roomId, currentUserId) => {
    try {
      if (!roomId || !currentUserId) {
        return { success: false, message: "Room ID and user ID are required" };
      }
      const updatedRoom = await this.roomService.leaveGroup(roomId, currentUserId);
      return { success: true, data: { room: updatedRoom } };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to leave group",
      };
    }
  };

  /**
   * Đổi tên nhóm qua socket
   */
  // Tối ưu: chỉ nhận Room ID, tìm group qua roomId rồi đổi tên
  renameGroup = async (roomId, name, currentUserId) => {
    try {
      if (!roomId || !name || !currentUserId) {
        return {
          success: false,
          message: "Room ID, name and user ID are required",
        };
      }

      const group = await this.groupService.renameGroupByRoomId(
        roomId,
        name,
        currentUserId
      );

      // Lấy thông tin room để gửi cho tất cả thành viên
      const room = await this.roomService.getRoomById(roomId);
      // debug removed

      // Tạo tin nhắn thông báo đổi tên nhóm
      const notificationMessage = `Nhóm đã được đổi tên thành: ${group.name}`;
      const createdMsgResult = await this.createMessageInRoom(
        currentUserId,
        roomId,
        notificationMessage
      );

      const createdMessage =
        createdMsgResult && createdMsgResult.success
          ? createdMsgResult.data.message
          : undefined;

      return {
        success: true,
        data: { group, room, message: createdMessage },
      };
    } catch (error) {
      console.error("Error in renameGroup controller:", error);
      return {
        success: false,
        message: error.message || "Failed to rename group",
      };
    }
  };

  /**
   * Chuyển quyền trưởng nhóm qua roomId
   */
  changeGroupOwner = async (roomId, currentUserId, newOwnerId) => {
    try {
      if (!roomId || !currentUserId || !newOwnerId) {
        return {
          success: false,
          message: "Room ID, current user ID and new owner ID are required",
        };
      }

      const updatedGroup = await this.groupService.changeGroupOwner(
        roomId,
        currentUserId,
        newOwnerId
      );

      // Lấy room để emit cho các thành viên
      const room = await this.roomService.getRoomById(roomId);

      // Tạo tin nhắn hệ thống thông báo chuyển quyền
      try {
        const actor = room?.members?.find?.(
          (m) => m._id.toString() === currentUserId.toString()
        );
        const newOwner = room?.members?.find?.(
          (m) => m._id.toString() === newOwnerId.toString()
        );
        const actorName = actor?.fullName || "Một thành viên";
        const newOwnerName = newOwner?.fullName || "thành viên khác";
        const systemMessage = `${actorName} đã chuyển quyền trưởng nhóm cho ${newOwnerName}`;
        const createdMsgResult = await this.createMessageInRoom(
          currentUserId,
          roomId,
          systemMessage
        );
        const createdMessage =
          createdMsgResult && createdMsgResult.success
            ? createdMsgResult.data.message
            : undefined;

        return {
          success: true,
          data: { group: updatedGroup, room, message: createdMessage },
        };
      } catch (e) {
        // Không chặn flow nếu tin nhắn hệ thống tạo thất bại
        return {
          success: true,
          data: { group: updatedGroup, room },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to change group owner",
      };
    }
  };

  dissolveGroup = async (roomId, currentUserId) => {
    try {
      if (!roomId || !currentUserId) {
        return { success: false, message: "Room ID and user ID are required" };
      }

      const result = await this.groupService.dissolveGroupByRoomId(
        roomId,
        currentUserId
      );

      // Lấy room để lấy danh sách members emit
      const room = await this.roomService.getRoomById(roomId);

      return { success: true, data: { room } };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to dissolve group",
      };
    }
  };
}

module.exports = new SocketController();
