"use strict";
//----------------------------------------------------------------
const MessageService = require("../services/MessageService");
const RoomService = require("../services/RoomService");
const GroupService = require("../services/GroupService");
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
}

module.exports = new SocketController();
