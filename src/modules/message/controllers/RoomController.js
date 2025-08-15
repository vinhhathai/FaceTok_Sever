"use strict";
//----------------------------------------------------------------
const MessageService = require("../services/MessageService");
const RoomService = require("../services/RoomService");
const { RoomDto, MessageDto } = require("../dtos");
const {
  getRoomsValidation,
  getRoomDetailsValidation,
  getRoomByIdValidation,
  kickOutMemberValidation,
  leaveGroupValidation,
} = require("../validations");
const { VALIDATION_ERRORS } = require("../../../shared/common/error");
const { inviteToGroupValidation } = require("../validations/groupValidation");
const SocketBus = require("../../../shared/socket/SocketBus");

class RoomController {
  constructor() {
    this.messageService = MessageService;
    this.roomService = RoomService;
  }

  inviteToGroup = async (req, res) => {
    try {
      const { error, value } = inviteToGroupValidation.validate(req.body);
      if (error) {
        return res.status(400).json(RoomDto.error(error.details[0].message));
      }
      const { roomId, userId } = value;
      const inviterId = req.user.id;
      const room = await this.roomService.inviteToGroup(roomId, userId, inviterId);
      // Broadcast via socket
      try {
        SocketBus.emitToRoom(roomId, "group_member_invited", { roomId, userId });
        SocketBus.emitToUser(userId, "group_member_invited", { roomId, userId });
      } catch {}
      return res.status(200).json(RoomDto.success(room));
    } catch (error) {
      return res.status(500).json(RoomDto.error(error));
    }
  };

  kickOutMember = async (req, res) => {
    try {
      const { error, value } = kickOutMemberValidation.validate(req.body);
      if (error) {
        return res.status(400).json(RoomDto.error(error.details[0].message));
      }
      const { roomId, kickOutUserId } = value;
      const currentUserId = req.user.id;
      const room = await this.roomService.kickOutMember(
        roomId,
        currentUserId,
        kickOutUserId
      );
      // Broadcast via socket
      try {
        SocketBus.emitToRoom(roomId, "group_member_kicked", { roomId, userId: kickOutUserId });
        SocketBus.emitToUser(kickOutUserId, "group_member_kicked", { roomId, userId: kickOutUserId });
      } catch {}
      return res.status(200).json(RoomDto.success(room));
    } catch (error) {
      return res.status(500).json(RoomDto.error(error));
    }
  };

  leaveGroup = async (req, res) => {
    try {
      const { error, value } = leaveGroupValidation.validate(req.body);
      if (error) {
        return res.status(400).json(RoomDto.error(error.details[0].message));
      }
      const { id } = value;
      const currentUserId = req.user.id;
      const group = await this.roomService.leaveGroup(id, currentUserId);
      // Broadcast via socket
      try {
        SocketBus.emitToUser(currentUserId, "group_left", { roomId: id });
        SocketBus.emitToRoom(id, "group_member_left", { roomId: id, userId: currentUserId });
      } catch {}
      return res.status(200).json(RoomDto.success(group));
    } catch (error) {
      return res.status(500).json(RoomDto.error(error));
    }
  };

  deleteConversation = async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;
      const { error } = getRoomByIdValidation.validate({ roomId });

      if (error) {
        return res
          .status(400)
          .json(
            RoomDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              error.details[0].message,
              error.details
            )
          );
      }

      const room = await this.roomService.deleteConversation(roomId, userId);
      return res.status(200).json(RoomDto.success({ room }));
    } catch (error) {
      return res
        .status(500)
        .json(
          RoomDto.error(
            SERVER_ERRORS.INTERNAL_SERVER_ERROR,
            "Internal server error",
            error.message
          )
        );
    }
  };

  getRooms = async (req, res) => {
    try {
      // Validate query parameters
      const { error, value } = getRoomsValidation.validate(req.query);

      if (error) {
        return res
          .status(400)
          .json(
            RoomDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              error.details[0].message,
              error.details
            )
          );
      }

      const userId = req.user.id;
      const limit = value.limit;

      try {
        const rooms = await this.roomService.getUserRooms(userId);

        return res.status(200).json(
          RoomDto.success({
            rooms: rooms,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            RoomDto.error(
              "GET_ROOMS_FAILED",
              "Failed to get rooms",
              error.message
            )
          );
      }
    } catch (error) {
      console.error("Error in getRooms controller:", error);
      return res
        .status(500)
        .json(
          RoomDto.error(
            "INTERNAL_SERVER_ERROR",
            "Internal server error",
            error.message
          )
        );
    }
  };

  getRoomDetails = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = req.params.userId;

      // Validate parameters
      const { error, value } = getRoomDetailsValidation.validate({
        userId: otherUserId,
      });

      if (error) {
        return res
          .status(400)
          .json(
            RoomDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              error.details[0].message,
              error.details
            )
          );
      }

      try {
        const room = await this.roomService.getRoomByUsers(
          currentUserId,
          value.userId
        );

        return res.status(200).json(
          RoomDto.success({
            room: room,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            RoomDto.error(
              "GET_ROOM_DETAILS_FAILED",
              "Failed to get room details",
              error.message
            )
          );
      }
    } catch (error) {
      console.error("Error in getRoomDetails controller:", error);
      return res
        .status(500)
        .json(
          RoomDto.error(
            "INTERNAL_SERVER_ERROR",
            "Internal server error",
            error.message
          )
        );
    }
  };

  getRoomById = async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const userId = req.user.id;

      // Validate parameters
      const { error } = getRoomByIdValidation.validate({
        roomId,
      });

      if (error) {
        return res
          .status(400)
          .json(
            RoomDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              error.details[0].message,
              error.details
            )
          );
      }

      try {
        const room = await this.roomService.getRoom(roomId);

        return res.status(200).json(
          RoomDto.success({
            room: room,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            RoomDto.error(
              "GET_ROOM_FAILED",
              "Failed to get room",
              error.message
            )
          );
      }
    } catch (error) {
      console.error("Error in getRoomById controller:", error);
      return res
        .status(500)
        .json(
          RoomDto.error(
            "INTERNAL_SERVER_ERROR",
            "Internal server error",
            error.message
          )
        );
    }
  };

  createRoom = async (req, res) => {
    try {
      const currentUserId = req.user.id;

      // Validate input data using Joi schema
      const { error, value } = createDirectRoomValidation.validate(req.body);

      // If validation fails, return error message
      if (error) {
        return res
          .status(400)
          .json(
            MessageDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              error.details[0].message
            )
          );
      }

      try {
        // Tìm hoặc tạo phòng chat
        const room = await this.roomService.getOrCreateRoom(
          currentUserId,
          value.targetUserId
        );

        return res.status(200).json(
          MessageDto.success({
            room: room,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            MessageDto.error(
              MESSAGE_ERRORS.CREATE_ROOM_FAILED,
              "Failed to create chat room",
              error.message
            )
          );
      }
    } catch (error) {
      return res
        .status(500)
        .json(
          MessageDto.error(
            MESSAGE_ERRORS.CREATE_ROOM_FAILED,
            "Unable to create chat room",
            error.message
          )
        );
    }
  };

  getOrCreateRoom = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { targetUserId } = req.body;

      try {
        // Tìm hoặc tạo phòng chat
        const room = await this.roomService.getOrCreateRoom(
          currentUserId,
          targetUserId
        );

        // Lấy room đã được cập nhật (có thể đã được khôi phục)
        const updatedRoom = await this.roomService.getRoom(room._id);

        return res.status(200).json(
          MessageDto.success({
            room: updatedRoom,
          })
        );
      } catch (error) {
        return res
          .status(500)
          .json(
            MessageDto.error(
              MESSAGE_ERRORS.CREATE_ROOM_FAILED,
              "Failed to get or create chat room",
              error.message
            )
          );
      }
    } catch (error) {
      return res
        .status(500)
        .json(
          MessageDto.error(
            MESSAGE_ERRORS.CREATE_ROOM_FAILED,
            "Unable to get or create chat room",
            error.message
          )
        );
    }
  };
}

module.exports = new RoomController();
