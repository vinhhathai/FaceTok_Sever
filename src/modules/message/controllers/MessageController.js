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
const { processAndUploadImage, uploadBufferToCloudinary, deleteFromCloudinary } = require("../../../shared/utils/cloudinaryUpload");
const sharp = require('sharp');

/**
 * Upload media files (images/videos) to Cloudinary
 */
async function uploadMediaFiles(files) {
  const mediaPromises = files.map(async (file) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage) {
      // Upload image with compression
      const result = await processAndUploadImage(
        file.buffer,
        'chaotok/chat/images',
        { 
          quality: 85,
          width: 1920,
          height: 1080,
          fit: 'inside',
          format: 'jpeg'
        },
        {
          public_id: `msg_img_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        }
      );

      // Get metadata
      const metadata = await sharp(file.buffer).metadata();

      return {
        type: 'image',
        url: result.secure_url,
        publicId: result.public_id,
        width: metadata.width,
        height: metadata.height,
        size: file.size,
      };
    } else if (isVideo) {
      // Upload video directly
      const result = await uploadBufferToCloudinary(file.buffer, {
        folder: 'chaotok/chat/videos',
        resource_type: 'video',
        public_id: `msg_vid_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        eager: [
          { 
            width: 640, 
            height: 360, 
            crop: 'limit',
            format: 'jpg',
            start_offset: '1.0'
          }
        ],
        eager_async: true,
      });

      const thumbnail = result.eager && result.eager[0] 
        ? result.eager[0].secure_url 
        : null;

      return {
        type: 'video',
        url: result.secure_url,
        publicId: result.public_id,
        thumbnail: thumbnail,
        width: result.width,
        height: result.height,
        size: file.size,
        duration: result.duration || 0,
      };
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
  });

  return await Promise.all(mediaPromises);
}

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
      const files = req.files; // From multer middleware

      // Validate: must have either content or media
      if (!content && (!files || files.length === 0)) {
        return res
          .status(400)
          .json(
            MessageDto.error(
              VALIDATION_ERRORS.INVALID_INPUT,
              "Message must have either text content or media attachments"
            )
          );
      }

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
        // Upload media files if present
        let mediaData = [];
        if (files && files.length > 0) {
          try {
            mediaData = await uploadMediaFiles(files);
          } catch (uploadError) {
            console.error('Error uploading media:', uploadError);
            return res.status(500).json(
              MessageDto.error(
                MESSAGE_ERRORS.SEND_MESSAGE_FAILED,
                "Failed to upload media files",
                uploadError.message
              )
            );
          }
        }

        // Create message with media
        const result = await this.messageService.createMessageInRoom(
          senderId,
          roomId,
          content || '', // Empty string if no text content
          mediaData
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
          senderId: (message.senderId?.toString?.() || String(message.senderId || '')),
          content: message.content,
          media: message.media, // Include media in broadcast
          roomId: message.roomId,
          createdAt: message.createdAt,
          sender: sender
            ? {
                id: (sender._id?.toString?.() || String(sender._id || '')),
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
        // Cleanup uploaded media if message creation fails
        if (files && files.length > 0 && mediaData && mediaData.length > 0) {
          for (const media of mediaData) {
            try {
              await deleteFromCloudinary(media.publicId, media.type);
            } catch (cleanupError) {
              console.error('Error cleaning up media:', cleanupError);
            }
          }
        }

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
