"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ProfileService } = require("../services");
const { ProfileDto } = require("../dtos");
const { profileValidation } = require("../validations");

/**
 * Controller xử lý các chức năng liên quan đến profile người dùng
 */
class ProfileController {
  constructor() {
    this.profileService = new ProfileService();
  }

  /**
   * Xem thông tin profile của người dùng theo ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProfile = async (req, res) => {
    try {
      // Lấy ID người dùng từ params
      const userId = req.params.id;

      // Kiểm tra ID
      if (!userId) {
        return res.status(400).json(
          ProfileDto.error(
            errorCode.VALIDATION_FAILED,
            errorMessage.ID_NOT_FOUND
          )
        );
      }

      // Gọi service để lấy thông tin profile
      const result = await this.profileService.getProfile(userId);

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Error in getProfile controller:", error);
      return res.status(500).json(
        ProfileDto.error(
          errorCode.ERR_RETRIEVE_PROFILE_FAILED,
          error.message || "Lỗi khi lấy thông tin profile"
        )
      );
    }
  };
}

module.exports = ProfileController; 