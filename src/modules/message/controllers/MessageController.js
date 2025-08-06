"use strict";
//----------------------------------------------------------------
const MessageService = require("../services/MessageService");
const { MessageDto } = require("../dtos");
const {
  sendMessageValidation,
  revokeMessageValidation,
} = require("../validations");
const {
  VALIDATION_ERRORS,
  MESSAGE_ERRORS,
} = require("../../../shared/common/error");

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
}

module.exports = new MessageController();
