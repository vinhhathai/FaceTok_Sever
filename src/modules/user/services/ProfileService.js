"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ProfileDto } = require("../dtos");

/**
 * Service xử lý các chức năng liên quan đến profile người dùng
 */
class ProfileService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Lấy thông tin profile người dùng theo ID
   * @param {string} userId - ID của người dùng cần lấy thông tin
   * @returns {Promise<Object>} Thông tin profile của người dùng
   */
  async getProfile(userId) {
    try {
      // Kiểm tra tính hợp lệ của ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return ProfileDto.error(
          errorCode.VALIDATION_FAILED,
          "ID người dùng không hợp lệ"
        );
      }

      // Tìm người dùng theo ID, loại bỏ password và __v
      const user = await this.userRepository.findById(userId, { password: 0, __v: 0 });
      
      // Kiểm tra người dùng có tồn tại không
      if (!user) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      // Sử dụng DTO để format dữ liệu trả về
      const profileData = ProfileDto.toResponse(user);

      // Trả về kết quả thành công
      return ProfileDto.success(profileData, "Lấy thông tin profile thành công");
    } catch (error) {
      console.error("Error in getProfile service:", error);
      return ProfileDto.error(
        errorCode.ERR_RETRIEVE_PROFILE_FAILED,
        "Lỗi khi lấy thông tin profile",
        error.message
      );
    }
  }
}

module.exports = ProfileService; 