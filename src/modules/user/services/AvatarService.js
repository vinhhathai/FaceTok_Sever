"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AvatarDto } = require("../dtos");
const {
  processAndUploadImage,
  deleteFromCloudinary
} = require("../../../shared/utils/cloudinaryUpload");

/**
 * Service handling user avatar related functionalities
 */
class AvatarService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Update user avatar with file upload
   * @param {string} userId - User ID to update
   * @param {Object} file - Uploaded file object
   * @returns {Promise<Object>} Result of avatar update
   */
  async updateAvatar(userId, file) {
    try {
      // Check if file exists
      if (!file) {
        return AvatarDto.error(
          errorCode.DATA_NOT_FOUND,
          "Profile picture not found"
        );
      }

      // Get current user to check if there's an existing avatar to delete
      const currentUser = await this.userRepository.findById(userId);
      const oldPublicId = currentUser?.profilePicturePublicId;

      // Delete old avatar from Cloudinary if exists
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId, 'image');
        } catch (error) {
          console.warn(`Failed to delete old avatar ${oldPublicId}:`, error.message);
          // Continue with upload even if deletion fails
        }
      }

      // Image processing options for avatar
      const imageOptions = {
        width: 400,
        height: 400,
        fit: "cover",
        format: "jpeg",
        quality: 85,
      };

      // Upload options for Cloudinary
      const uploadOptions = {
        public_id: `user_${userId}_profile_${Date.now()}`, // Unique identifier
        tags: ["profile_picture", `user_${userId}`],
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
      };

      // Process and upload image
      const result = await processAndUploadImage(
        file.buffer,
        "chaotok/avatars", // Cloudinary folder
        imageOptions,
        uploadOptions
      );
      
      if (!result) {
        return AvatarDto.error(
          errorCode.ERR_UPDATE_AVATAR_FAILED,
          "Error saving avatar to server"
        );
      }
      
      // Update user's avatar URL and publicId in database
      const updatedUser = await this.userRepository.updateAvatar(
        userId, 
        result.secure_url,
        result.public_id
      );
      
      if (!updatedUser) {
        return AvatarDto.error(
          errorCode.ERR_UPDATE_AVATAR_FAILED,
          "Could not update avatar in database"
        );
      }
      
      return AvatarDto.success(
        {
          profilePictureUrl: result.secure_url,
          publicId: result.public_id
        }, 
        "Profile picture updated successfully"
      );
    } catch (error) {
      return AvatarDto.error(
        errorCode.ERR_UPDATE_AVATAR_FAILED,
        "Error updating profile picture",
        error.message
      );
    }
  }
}

module.exports = AvatarService; 