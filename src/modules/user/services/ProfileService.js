"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
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

  async getProfile(viewingUserId, logingUserId) {
    try {
      // Tìm người dùng theo ID, loại bỏ password và __v
      const user = await this.userRepository.findById(viewingUserId, {
        password: 0,
        __v: 0,
      });

      // Kiểm tra người dùng có tồn tại không
      if (!user) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }
      // So sánh để xác định có phải chủ sở hữu không
      const isOwner = viewingUserId.toString() === logingUserId.toString();

      // Sử dụng DTO để format dữ liệu trả về
      const profileData = ProfileDto.toResponse(user, isOwner);

      // Trả về kết quả thành công
      return ProfileDto.success(
        profileData,
        "Lấy thông tin profile thành công"
      );
    } catch (error) {
      return ProfileDto.error(
        errorCode.ERR_RETRIEVE_PROFILE_FAILED,
        "Lỗi khi lấy thông tin profile",
        error.message
      );
    }
  }

  /**
   * Cập nhật thông tin profile người dùng
   * @param {string} userId - ID của người dùng cần cập nhật
   * @param {Object} profileData - Dữ liệu profile cần cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật profile
   */
  async updateProfile(userId, profileData) {
    try {
      console.log(
        `[ProfileService] Bắt đầu cập nhật profile cho userId: ${userId}`
      );

      // Kiểm tra tính hợp lệ của ID
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.log(`[ProfileService] UserID không hợp lệ: ${userId}`);
        return ProfileDto.error(
          errorCode.VALIDATION_FAILED,
          "ID người dùng không hợp lệ"
        );
      }

      // Kiểm tra người dùng có tồn tại không
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        console.log(
          `[ProfileService] Không tìm thấy người dùng với ID: ${userId}`
        );
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      console.log(
        `[ProfileService] Tìm thấy người dùng: ${existingUser.fullName}`
      );
      console.log(`[ProfileService] Dữ liệu cập nhật:`, profileData);

      // Chuẩn bị dữ liệu cập nhật
      const updateData = {};

      // Chỉ cập nhật các trường có trong request
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.fullName !== undefined)
        updateData.fullName = profileData.fullName;
      if (profileData.gender !== undefined)
        updateData.gender = profileData.gender;
      if (profileData.location !== undefined)
        updateData.location = profileData.location;
      if (profileData.relationship !== undefined)
        updateData.relationship = profileData.relationship;
      if (profileData.birthday !== undefined)
        updateData.birthday = new Date(profileData.birthday);

      console.log(`[ProfileService] Dữ liệu đã chuẩn bị:`, updateData);

      // Cập nhật profile
      const updatedUser = await this.userRepository.updateProfile(
        userId,
        updateData
      );

      // Kiểm tra kết quả cập nhật
      if (!updatedUser) {
        console.log(
          `[ProfileService] Không thể cập nhật profile cho userId: ${userId}`
        );
        return ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          "Không thể cập nhật thông tin cá nhân"
        );
      }

      console.log(
        `[ProfileService] Cập nhật profile thành công cho userId: ${userId}`
      );

      // Format dữ liệu trả về bằng DTO
      const responseData = ProfileDto.toResponse(updatedUser);

      // Trả về kết quả thành công
      return ProfileDto.success(
        responseData,
        "Cập nhật thông tin cá nhân thành công"
      );
    } catch (error) {
      console.error("Error in updateProfile service:", error);
      return ProfileDto.error(
        errorCode.UPDATE_PROFILE_FAILED,
        "Lỗi khi cập nhật thông tin cá nhân",
        error.message
      );
    }
  }
}

module.exports = ProfileService;
