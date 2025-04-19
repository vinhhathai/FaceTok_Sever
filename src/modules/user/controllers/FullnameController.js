"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FullnameService } = require("../services");
const { FullnameDto } = require("../dtos");
const { fullnameValidation } = require("../validations");

/**
 * Controller xử lý các chức năng liên quan đến họ tên người dùng
 */
class FullnameController {
  constructor() {
    this.fullnameService = new FullnameService();
  }

  /**
   * Cập nhật họ tên người dùng
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateFullName = async (req, res) => {
    try {
      console.log("Update fullname request received");
      
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = fullnameValidation.fullnameUpdateValidation.validate(req.body);
      
      if (error) {
        return res.status(400).json(
          FullnameDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      // Lấy ID người dùng từ token
      const userId = req.user.id;
      
      console.log("User ID:", userId);
      console.log("New fullname:", value.fullName);

      // Kiểm tra ID
      if (!userId) {
        return res.status(400).json(
          FullnameDto.error(
            errorCode.VALIDATION_FAILED,
            errorMessage.ID_NOT_FOUND
          )
        );
      }

      // Format data bằng DTO
      const fullnameData = FullnameDto.toUpdateData(value);

      // Gọi service để cập nhật họ tên
      const result = await this.fullnameService.updateFullName(userId, fullnameData.fullName);

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        } else if (result.error && result.error.code === errorCode.NAME_UPDATE_TIME_LIMIT) {
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
      console.error("Error in updateFullName controller:", error);
      return res.status(500).json(
        FullnameDto.error(
          errorCode.ERR_UPDATE_PROFILE_FAILED,
          error.message || "Lỗi khi cập nhật họ tên"
        )
      );
    }
  };
}

module.exports = FullnameController; 