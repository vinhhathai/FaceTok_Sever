"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ThumbnailDto } = require("../dtos");
const {
  processAndUploadImage,
  deleteFromCloudinary
} = require("../../../shared/utils/cloudinaryUpload");

/**
 * Service xử lý các chức năng liên quan đến thumbnail người dùng
 */
class ThumbnailService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async updateThumbnail(userId, file) {
    try {
      // Check if file exists
      if (!file) {
        return ThumbnailDto.error(
          errorCode.DATA_NOT_FOUND,
          "Không tìm thấy ảnh bìa"
        );
      }

      // Get current user to check if there's an existing thumbnail to delete
      const currentUser = await this.userRepository.findById(userId);
      const oldPublicId = currentUser?.thumbnailPublicId;

      // Delete old thumbnail from Cloudinary if exists
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId, 'image');
        } catch (error) {
          console.warn(`Failed to delete old thumbnail ${oldPublicId}:`, error.message);
          // Continue with upload even if deletion fails
        }
      }

      // Image processing options for cover photos
      const imageOptions = {
        width: 1200,
        height: 400,
        fit: "cover",
        format: "jpeg",
        quality: 80,
      };

      // Upload options for Cloudinary
      const uploadOptions = {
        public_id: `user_${userId}_thumbnail_${Date.now()}`, // Unique identifier
        tags: ["thumbnail", `user_${userId}`],
        transformation: [
          { width: 1200, height: 400, crop: "fill", gravity: "auto" },
        ],
      };

      // Process and upload image
      const result = await processAndUploadImage(
        file.buffer,
        "chaotok/thumbnails", // Cloudinary folder
        imageOptions,
        uploadOptions
      );
      if (!result) {
        return ThumbnailDto.error(
          errorCode.UPDATE_THUMBNAIL_SAVING_FAILED,
          "Lỗi khi lưu ảnh bìa lên máy chủ"
        );
      }
      
      // Update user's thumbnail URL and publicId in database
      await this.userRepository.updateThumbnail(
        userId, 
        result.secure_url,
        result.public_id
      );
      
      return ThumbnailDto.success(result, "Cập nhật ảnh bìa thành công");
    } catch (error) {
      return ThumbnailDto.error(
        errorCode.UPDATE_THUMBNAIL_FAILED + "tuntun",
        "Lỗi không xác định khi cập nhật ảnh bìa",
        error.message
      );
    }
  }
}

module.exports = ThumbnailService;
