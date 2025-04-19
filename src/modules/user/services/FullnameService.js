"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FullnameDto } = require("../dtos");

/**
 * Service xử lý các chức năng liên quan đến họ tên người dùng
 */
class FullnameService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Cập nhật họ tên người dùng
   * @param {string} userId - ID của người dùng cần cập nhật
   * @param {string} fullName - Họ tên mới
   * @returns {Promise<Object>} Kết quả cập nhật họ tên
   */
  async updateFullName(userId, fullName) {
    try {
      console.log(`[FullnameService] Bắt đầu cập nhật họ tên cho userId: ${userId}`);
      
      // Kiểm tra tính hợp lệ của userId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.log(`[FullnameService] UserID không hợp lệ: ${userId}`);
        return FullnameDto.error(
          errorCode.VALIDATION_FAILED,
          "ID người dùng không hợp lệ"
        );
      }

      // Kiểm tra tính hợp lệ của fullName
      if (!fullName || fullName.trim() === '') {
        console.log(`[FullnameService] Họ tên không hợp lệ: ${fullName}`);
        return FullnameDto.error(
          errorCode.VALIDATION_FAILED,
          "Họ tên không được để trống"
        );
      }

      // Kiểm tra xem người dùng có tồn tại không
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        console.log(`[FullnameService] Không tìm thấy người dùng với ID: ${userId}`);
        return FullnameDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      console.log(`[FullnameService] Tìm thấy người dùng: ${existingUser.fullName}, lastNameUpdateTime: ${existingUser.lastNameUpdateTime}`);

      // Kiểm tra thời gian cập nhật tên lần cuối
      const lastNameUpdateTime = existingUser.lastNameUpdateTime || new Date(0); // Nếu chưa có, lấy thời điểm 0
      const currentTime = new Date();
      const timeDiffMs = currentTime.getTime() - lastNameUpdateTime.getTime();
      const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));
      
      console.log(`[FullnameService] Thời gian hiện tại: ${currentTime}`);
      console.log(`[FullnameService] Thời gian cập nhật tên lần cuối: ${lastNameUpdateTime}`);
      console.log(`[FullnameService] Thời gian đã trôi qua (phút): ${timeDiffMinutes}`);
      
      // Kiểm tra xem đã đủ 60 phút kể từ lần đổi tên gần nhất chưa
      if (timeDiffMinutes < 60) {
        const timeRemaining = 60 - timeDiffMinutes;
        console.log(`[FullnameService] Chưa đủ thời gian, còn ${timeRemaining} phút nữa`);
        return FullnameDto.error(
          errorCode.NAME_UPDATE_TIME_LIMIT,
          `Bạn cần đợi thêm ${timeRemaining} phút nữa để đổi tên`,
          { timeRemaining }
        );
      }

      console.log(`[FullnameService] Đủ thời gian để cập nhật tên, tiến hành cập nhật`);
      
      // Cập nhật họ tên
      const updatedUser = await this.userRepository.updateFullName(userId, fullName, currentTime);
      
      // Kiểm tra kết quả cập nhật
      if (!updatedUser) {
        console.log(`[FullnameService] Không thể cập nhật họ tên cho userId: ${userId}`);
        return FullnameDto.error(
          errorCode.ERR_UPDATE_PROFILE_FAILED,
          "Không thể cập nhật họ tên"
        );
      }

      console.log(`[FullnameService] Cập nhật họ tên thành công: ${updatedUser.fullName}, thời gian cập nhật: ${updatedUser.lastNameUpdateTime}`);

      // Format dữ liệu trả về bằng DTO
      const responseData = FullnameDto.toResponse(updatedUser);

      // Xử lý trường hợp lastNameUpdateTime có thể null/undefined
      // Nếu lastNameUpdateTime tồn tại thì tính thời gian có thể cập nhật tên tiếp theo
      let nextNameUpdateAvailable;
      if (updatedUser.lastNameUpdateTime) {
        nextNameUpdateAvailable = new Date(updatedUser.lastNameUpdateTime.getTime() + 60 * 60 * 1000);
      } else {
        nextNameUpdateAvailable = new Date(currentTime.getTime() + 60 * 60 * 1000);
      }
      
      responseData.nextNameUpdateAvailable = nextNameUpdateAvailable;
      console.log(`[FullnameService] Thời gian có thể cập nhật tên tiếp theo: ${nextNameUpdateAvailable}`);

      // Trả về kết quả thành công
      return FullnameDto.success(responseData, "Cập nhật họ tên thành công");
    } catch (error) {
      console.error("Error in updateFullName service:", error);
      return FullnameDto.error(
        errorCode.ERR_UPDATE_PROFILE_FAILED,
        "Lỗi khi cập nhật họ tên",
        error.message
      );
    }
  }
}

module.exports = FullnameService; 