"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AvatarService } = require("../services");
const { AvatarDto } = require("../dtos");
const { avatarValidation } = require("../validations");

/**
 * Controller xử lý các chức năng liên quan đến avatar người dùng
 */
class AvatarController {
  constructor() {
    this.avatarService = new AvatarService();
  }

  /**
   * Cập nhật avatar người dùng
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateAvatarUrl = async (req, res) => {
    try {
      console.log("Update avatar URL request received");
      
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = avatarValidation.avatarUpdateValidation.validate(req.body);
      
      if (error) {
        return res.status(400).json(
          AvatarDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      // Lấy ID người dùng từ token
      const userId = req.user.id;
      
      console.log("User ID:", userId);
      console.log("Avatar URL:", value.avatarUrl);

      // Kiểm tra ID
      if (!userId) {
        return res.status(400).json(
          AvatarDto.error(
            errorCode.VALIDATION_FAILED,
            errorMessage.ID_NOT_FOUND
          )
        );
      }

      // Format data bằng DTO
      const avatarData = AvatarDto.toUpdateData(value);

      // Gọi service để cập nhật avatar
      const result = await this.avatarService.updateAvatar(userId, avatarData.avatarUrl);

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
      console.error("Error in updateAvatarUrl controller:", error);
      return res.status(500).json(
        AvatarDto.error(
          errorCode.ERR_UPDATE_AVATAR_FAILED,
          error.message || "Lỗi khi cập nhật avatar"
        )
      );
    }
  };
}

module.exports = AvatarController; 