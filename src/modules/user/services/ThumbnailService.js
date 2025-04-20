"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ThumbnailDto } = require("../dtos");

/**
 * Service xử lý các chức năng liên quan đến thumbnail người dùng
 */
class ThumbnailService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Cập nhật thumbnail người dùng
   * @param {string} userId - ID của người dùng cần cập nhật
   * @param {string} thumbnailUrl - URL của thumbnail mới
   * @returns {Promise<Object>} Kết quả cập nhật thumbnail
   */
  async updateThumbnail(userId, thumbnailUrl) {
    try {
      // Kiểm tra tính hợp lệ của userId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return ThumbnailDto.error(
          errorCode.VALIDATION_FAILED,
          "ID người dùng không hợp lệ"
        );
      }

      // Kiểm tra tính hợp lệ của thumbnailUrl
      if (!thumbnailUrl) {
        return ThumbnailDto.error(
          errorCode.VALIDATION_FAILED,
          "URL thumbnail không được để trống"
        );
      }

      // Kiểm tra xem người dùng có tồn tại không
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return ThumbnailDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      // Cập nhật thumbnail
      const updatedUser = await this.userRepository.updateThumbnail(userId, thumbnailUrl);
      
      // Kiểm tra kết quả cập nhật
      if (!updatedUser) {
        return ThumbnailDto.error(
          errorCode.ERR_UPDATE_THUMBNAIL_FAILED,
          "Không thể cập nhật thumbnail"
        );
      }

      // Format dữ liệu trả về bằng DTO
      const responseData = ThumbnailDto.toResponse(updatedUser);

      // Trả về kết quả thành công
      return ThumbnailDto.success(responseData, "Cập nhật thumbnail thành công");
    } catch (error) {
      console.error("Error in updateThumbnail service:", error);
      return ThumbnailDto.error(
        errorCode.ERR_UPDATE_THUMBNAIL_FAILED,
        "Lỗi khi cập nhật thumbnail",
        error.message
      );
    }
  }
}

module.exports = ThumbnailService;