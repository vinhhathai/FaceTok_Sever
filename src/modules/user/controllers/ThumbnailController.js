"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ThumbnailService } = require("../services");
const { ThumbnailDto } = require("../dtos");
const { thumbnailValidation } = require("../validations");

/**
 * Controller xử lý các chức năng liên quan đến thumbnail người dùng
 */
class ThumbnailController {
  constructor() {
    this.thumbnailService = new ThumbnailService();
  }

  /**
   * Cập nhật thumbnail người dùng
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateThumbnailUrl = async (req, res) => {
    try {
      console.log("Update thumbnail URL request received");
      
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = thumbnailValidation.thumbnailUpdateValidation.validate(req.body);
      
      if (error) {
        return res.status(400).json(
          ThumbnailDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      // Lấy ID người dùng từ token
      const userId = req.user.id;
      
      console.log("User ID:", userId);
      console.log("Thumbnail URL:", value.thumbnailUrl);

      // Kiểm tra ID
      if (!userId) {
        return res.status(400).json(
          ThumbnailDto.error(
            errorCode.VALIDATION_FAILED,
            errorMessage.ID_NOT_FOUND
          )
        );
      }



      // Gọi service để cập nhật thumbnail
      const result = await this.thumbnailService.updateThumbnail(userId, value.thumbnailUrl);

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
      console.error("Error in updateThumbnailUrl controller:", error);
      return res.status(500).json(
        ThumbnailDto.error(
          errorCode.ERR_UPDATE_THUMBNAIL_FAILED,
          error.message || "Lỗi khi cập nhật thumbnail"
        )
      );
    }
  };
}

module.exports = ThumbnailController; 