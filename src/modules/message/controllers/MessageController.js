"use strict";
//----------------------------------------------------------------
const MessageService = require("../services/MessageService");
const { MessageDto } = require("../dtos");
const SocketBus = require("../../../shared/socket/SocketBus");
const { sendMessageValidation } = require("../validations");
const {
  VALIDATION_ERRORS,
  MESSAGE_ERRORS,
} = require("../../../shared/common/error");
const mongoose = require("mongoose");

class MessageController {
  constructor() {
    this.messageService = MessageService;
  }

  /**
   * Get messages from a room
   */
  getMessages = async (req, res) => {
    try {
      const { roomId } = req.params;
      const { limit = 10, skip = 0 } = req.query;

      if (!roomId) {
        return res
          .status(400)
          .json(
            MessageDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              "Room ID is required"
            )
          );
      }

      try {
        const messages = await this.messageService.getMessages(
          roomId,
          parseInt(limit),
          parseInt(skip)
        );

        return res.status(200).json(
          MessageDto.success({
            messages: messages,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            MessageDto.error(
              MESSAGE_ERRORS.GET_MESSAGES_FAILED,
              "Failed to get messages",
              error.message
            )
          );
      }
    } catch (error) {
      console.error("Error getting messages:", error);
      return res
        .status(500)
        .json(
          MessageDto.error(
            MESSAGE_ERRORS.GET_MESSAGES_FAILED,
            "Unable to get messages",
            error.message
          )
        );
    }
  };

  /**
   * Tạo tin nhắn trong phòng đã tồn tại
   */
  createMessageInRoom = async (req, res) => {
    try {
      const senderId = req.user.id;
      const { roomId } = req.params;
      const { content } = req.body;

      if (!roomId || !content) {
        return res
          .status(400)
          .json(
            MessageDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              "Room ID and content are required"
            )
          );
      }

      try {
        const result = await this.messageService.createMessageInRoom(
          senderId,
          roomId,
          content
        );

        // Broadcast real-time update
        const { message, room } = result;
        
        // Find sender info from room members
        const sender = room.members.find(
          (member) => member._id.toString() === senderId.toString()
        );

        // Create message data for broadcast
        const messageData = {
          _id: message._id,
          senderId: message.senderId,
          content: message.content,
          roomId: message.roomId,
          createdAt: message.createdAt,
          sender: sender
            ? {
                _id: sender._id,
                fullName: sender.fullName,
                profilePicture: sender.profilePicture,
              }
            : undefined,
        };

        // Broadcast to room
        SocketBus.emitToRoom(roomId, "message_received", messageData);
        
        // Send notification to other members
        const otherMembers = room.members
          .filter((member) => member._id.toString() !== senderId)
          .map((member) => member._id.toString());

        // Không gửi notification cho message theo yêu cầu

        return res.status(200).json(
          MessageDto.success({
            message: result.message,
            room: result.room,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            MessageDto.error(
              MESSAGE_ERRORS.SEND_MESSAGE_FAILED,
              "Failed to create message",
              error.message
            )
          );
      }
    } catch (error) {
      return res
        .status(500)
        .json(
          MessageDto.error(
            MESSAGE_ERRORS.SEND_MESSAGE_FAILED,
            "Unable to create message",
            error.message
          )
        );
    }
  };

  /**
   * Revoke a message by id (sender only)
   * - Marks message as revoked in DB
   * - Broadcasts `message_revoked` to room and sender's devices
   */
  revokeMessage = async (req, res) => {
    try {
      const senderId = req.user.id;
      const { messageId } = req.body;

      if (!messageId || !mongoose.isValidObjectId(messageId)) {
        return res
          .status(400)
          .json(
            MessageDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              "Invalid messageId"
            )
          );
      }

      // Update DB
      const revoked = await this.messageService.revokeMessage(
        messageId,
        senderId
      );
      if (!revoked) {
        return res
          .status(404)
          .json(
            MessageDto.error(
              MESSAGE_ERRORS.MESSAGE_NOT_FOUND || "MESSAGE_NOT_FOUND",
              "Message not found or not owned by user"
            )
          );
      }

      // Determine roomId for broadcast
      const roomId = revoked.roomId?.toString?.() || revoked.roomId;

      // Broadcast via socket if available
      if (roomId) {
        SocketBus.emitToRoom(roomId, "message_revoked", { messageId });
      }
      SocketBus.emitToUser(senderId, "message_revoked", { messageId });

      return res
        .status(200)
        .json(MessageDto.success({ messageId, revoked: true }));
    } catch (error) {
      return res
        .status(500)
        .json(
          MessageDto.error(
            MESSAGE_ERRORS.REVOKE_MESSAGE_FAILED || "REVOKE_MESSAGE_FAILED",
            "Failed to revoke message",
            error.message
          )
        );
    }
  };
}

module.exports = new MessageController();
