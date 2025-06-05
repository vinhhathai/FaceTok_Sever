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

  /**
   * Get recent chat rooms for a user
   * @param {String} userId - User ID
   * @param {Number} limit - Maximum number of rooms to return
   * @returns {Object} Query result with list of rooms
   */
  async getRooms(userId, limit = 10) {
    try {
      const result = await this.messageRepository.getRooms(userId, limit);

      if (!result.success) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
            message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
            details: result.error,
          },
        };
      }

      // Transform rooms using DTO
      const formattedRooms = RoomDto.toResponseList(result.data, userId);

      return {
        success: true,
        statusCode: 200,
        data: formattedRooms,
      };
    } catch (error) {
      console.error("Error in getRooms service:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
          message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
      };
    }
  }

  /**
   * Get chat room details and messages between two users
   * @param {String} currentUserId - Current user ID
   * @param {String} otherUserId - Other user ID to chat with
   * @param {Number} page - Page number
   * @param {Number} limit - Number of messages per page
   * @returns {Object} Query result with room details and messages
   */
  async getRoomDetails(currentUserId, otherUserId) {
    try {
      // Get chat room
      let roomResult = await this.messageRepository.getRoomByMembers(
        currentUserId,
        otherUserId
      );

      if (!roomResult.success) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
            message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
            details: roomResult.error,
          },
        };
      }

      const room = roomResult.data;

      // If room doesn't exist yet, return empty data
      if (!room) {
        return {
          success: true,
          statusCode: 200,
          data: {
            room: null,
          },
        };
      }

      // Transform room using DTO
      const formattedRoom = RoomDto.toResponseRoom(room, currentUserId);

      // Get messages for the room
      const messagesResult = await this.messageRepository.getMessages(room._id);

      if (!messagesResult.success) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
            message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
            details: messagesResult.error,
          },
        };
      }

      // Mark messages as read for current user
      await this.messageRepository.markMessagesAsRead(room._id, currentUserId);

      // Format messages using DTO
      const formattedMessages = MessageDto.toResponseList(
        messagesResult.data.messages
      );

      return {
        success: true,
        statusCode: 200,
        data: {
          room: formattedRoom,
          messages: formattedMessages,
        },
      };
    } catch (error) {
      console.error("Error in getRoomDetails service:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
          message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
      };
    }
  }

  // /**
  //  * Get unread message count for a user
  //  * @param {String} userId - User ID
  //  * @returns {Object} Query result with unread message count
  //  */
  // async getUnreadCount(userId) {
  //     try {
  //         const result = await this.messageRepository.countUnreadMessages(userId);

  //         if (!result.success) {
  //             return {
  //                 success: false,
  //                 statusCode: 500,
  //                 error: {
  //                     code: errorCode.INTERNAL_SERVER_ERROR,
  //                     message: errorMessage.INTERNAL_SERVER_ERROR,
  //                     details: result.error
  //                 }
  //             };
  //         }

  //         return {
  //             success: true,
  //             statusCode: 200,
  //             data: result.data
  //         };
  //     } catch (error) {
  //         console.error('Error in getUnreadCount service:', error);
  //         return {
  //             success: false,
  //             statusCode: 500,
  //             error: {
  //                 code: errorCode.INTERNAL_SERVER_ERROR,
  //                 message: errorMessage.INTERNAL_SERVER_ERROR,
  //                 details: error.message
  //             }
  //         };
  //     }
  // }

  /**
   * Send a message from one user to another
   * @param {String} senderId - Sender user ID
   * @param {String} receiverId - Receiver user ID
   * @param {String} content - Message content
   * @returns {Object} Result with sent message data
   */
  async sendMessage(senderId, receiverId, content) {
    try {
      // Validate input
      if (!senderId || !receiverId || !content || content.trim() === "") {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: VALIDATION_ERRORS.INVALID_INPUT,
            message: VALIDATION_MESSAGES.INVALID_INPUT,
            details: "Sender ID, receiver ID and content are required",
          },
        };
      }

      // Check if sender is trying to send message to self
      if (senderId === receiverId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: VALIDATION_ERRORS.INVALID_INPUT,
            message: VALIDATION_MESSAGES.INVALID_INPUT,
            details: "Cannot send message to yourself",
          },
        };
      }

      // Check if receiver exists
      const receiverExists = await this.messageRepository.checkUserExists(receiverId);
      if (!receiverExists.success || !receiverExists.data) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: DATA_ERRORS.USER_NOT_FOUND,
            message: DATA_MESSAGES.USER_NOT_FOUND,
            details: "Receiver not found",
          },
        };
      }

      // Send the message
      const result = await this.messageRepository.sendMessage(
        senderId,
        receiverId,
        content
      );

      if (!result.success) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
            message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
            details: result.error,
          },
        };
      }

      // Format the response with DTOs
      const formattedMessage = MessageDto.toResponse(result.data.message);
      const formattedRoom = RoomDto.toResponseRoom(result.data.room, senderId);

      return {
        success: true,
        statusCode: 201,
        data: {
          message: formattedMessage,
          room: formattedRoom,
        },
      };
    } catch (error) {
      console.error("Error in sendMessage service:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
          message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
      };
    }
  }

  /**
   * Mark messages as read in a room
   * @param {String} roomId - Room ID
   * @param {String} userId - User ID
   * @returns {Object} Result with updated unread count
   */
  async markAsRead(roomId, userId) {
    try {
      // Check if room exists
      const room = await this.messageRepository.getRoomById(roomId);
      
      if (!room.success || !room.data) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: DATA_ERRORS.RESOURCE_NOT_FOUND,
            message: DATA_MESSAGES.RESOURCE_NOT_FOUND,
            details: 'The requested chat room does not exist'
          }
        };
      }
      
      // Check if user is a member of the room
      const isMember = room.data.members.some(
        member => member._id.toString() === userId
      );
      
      if (!isMember) {
        return {
          success: false,
          statusCode: 403,
          error: {
            code: VALIDATION_ERRORS.UNAUTHORIZED,
            message: VALIDATION_MESSAGES.UNAUTHORIZED,
            details: 'You are not a member of this chat room'
          }
        };
      }
      
      // Mark messages as read
      const result = await this.messageRepository.markMessagesAsRead(roomId, userId);
      
      if (!result.success) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
            message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
            details: result.error
          }
        };
      }
      
      return {
        success: true,
        statusCode: 200,
        data: {
          roomId,
          unreadCount: 0
        }
      };
    } catch (error) {
      console.error('Error in markAsRead service:', error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
          message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
          details: error.message
        }
      };
    }
  }

  /**
   * Create a direct chat room between two users
   * @param {String} currentUserId - Current user ID
   * @param {String} targetUserId - Target user ID to chat with
   * @returns {Object} Result with the created chat room
   */
  async createDirectRoom(currentUserId, targetUserId) {
    try {
      // Validate input data
      if (!currentUserId || !targetUserId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: VALIDATION_ERRORS.MISSING_FIELDS,
            message: VALIDATION_MESSAGES.MISSING_FIELDS,
            details: "Current user ID and target user ID are required",
          },
        };
      }

      // Check if trying to create a chat with yourself
      if (currentUserId === targetUserId) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: VALIDATION_ERRORS.INVALID_INPUT,
            message: VALIDATION_MESSAGES.INVALID_INPUT,
            details: "Cannot create a chat room with yourself",
          },
        };
      }

      // Check if target user exists
      const userExists = await this.messageRepository.checkUserExists(
        targetUserId
      );
      if (!userExists.success || !userExists.data) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: DATA_ERRORS.USER_NOT_FOUND,
            message: DATA_MESSAGES.USER_NOT_FOUND,
            details: "The user you want to chat with does not exist",
          },
        };
      }

      // Check if a chat room already exists between these two users
      const existingRoom = await this.messageRepository.getRoomByMembers(
        currentUserId,
        targetUserId
      );

      if (existingRoom.success && existingRoom.data) {
        // Room already exists, return it
        const room = existingRoom.data;
        const formattedRoom = RoomDto.toResponseRoom(room, currentUserId);

        return {
          success: true,
          statusCode: 200,
          data: formattedRoom,
        };
      }

      // Create a new direct chat room
      const members = [currentUserId, targetUserId];
      const createResult = await this.messageRepository.createRoom(
        members,
        false, // isGroup = false
        null, // groupName = null
        null // groupAvatar = null
      );

      if (!createResult.success) {
        return {
          success: false,
          statusCode: 500,
          error: {
            code: MESSAGE_ERRORS.CREATE_ROOM_FAILED,
            message: MESSAGE_MESSAGES.CREATE_ROOM_FAILED,
            details: createResult.error,
          },
        };
      }

      const formattedRoom = RoomDto.toResponse(
        createResult.data,
        currentUserId
      );

      return {
        success: true,
        statusCode: 201,
        data: formattedRoom,
      };
    } catch (error) {
      console.error("Error in createDirectRoom service:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: SERVER_ERRORS.INTERNAL_SERVER_ERROR,
          message: SERVER_MESSAGES.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
      };
    }
  }
}

// Export instance instead of class
module.exports = new MessageService();
