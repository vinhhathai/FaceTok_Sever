"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AvatarDto } = require("../dtos");

/**
 * Service xử lý các chức năng liên quan đến avatar người dùng
 */
class AvatarService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Cập nhật avatar người dùng
   * @param {string} userId - ID của người dùng cần cập nhật
   * @param {string} avatarUrl - URL của avatar mới
   * @returns {Promise<Object>} Kết quả cập nhật avatar
   */
  async updateAvatar(userId, avatarUrl) {
    try {
      // Kiểm tra tính hợp lệ của userId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return AvatarDto.error(
          errorCode.VALIDATION_FAILED,
          "ID người dùng không hợp lệ"
        );
      }

      // Kiểm tra tính hợp lệ của avatarUrl
      if (!avatarUrl) {
        return AvatarDto.error(
          errorCode.VALIDATION_FAILED,
          "URL avatar không được để trống"
        );
      }

      // Kiểm tra xem người dùng có tồn tại không
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return AvatarDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      // Cập nhật avatar
      const updatedUser = await this.userRepository.updateAvatar(userId, avatarUrl);
      
      // Kiểm tra kết quả cập nhật
      if (!updatedUser) {
        return AvatarDto.error(
          errorCode.ERR_UPDATE_AVATAR_FAILED,
          "Không thể cập nhật avatar"
        );
      }

      // Format dữ liệu trả về bằng DTO
      const responseData = AvatarDto.toResponse(updatedUser);

      // Trả về kết quả thành công
      return AvatarDto.success(responseData, "Cập nhật avatar thành công");
    } catch (error) {
      console.error("Error in updateAvatar service:", error);
      return AvatarDto.error(
        errorCode.ERR_UPDATE_AVATAR_FAILED,
        "Lỗi khi cập nhật avatar",
        error.message
      );
    }
  }
}

module.exports = AvatarService; 