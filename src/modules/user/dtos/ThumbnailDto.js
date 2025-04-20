"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO cho xử lý dữ liệu thumbnail người dùng
 */
class ThumbnailDto {
  
  /**
   * Format dữ liệu input cho cập nhật thumbnail
   * @param {Object} data - Dữ liệu đầu vào
   * @returns {Object} Dữ liệu đã được format
   */
  static toUpdateData(data) {
    return {
      thumbnailUrl: data.thumbnailUrl
    };
  }

  /**
   * Format dữ liệu response cho thumbnail
   * @param {Object} user - Dữ liệu người dùng sau khi cập nhật
   * @returns {Object} Dữ liệu thumbnail đã được format
   */
  static toResponse(user) {
    return {
      id: user._id,
      thumbnail: user.thumbnail || "",
      updatedAt: user.updatedAt
    };
  }

  /**
   * Chuyển đổi response thành định dạng lỗi
   * @param {string} code - Mã lỗi
   * @param {string} message - Thông báo lỗi
   * @param {any} detail - Chi tiết lỗi (nếu có)
   * @returns {Object} Object chứa thông tin lỗi
   */
  static error(code, message, detail = null) {
    return dtoResponse.error(code, message, detail);
  }

  /**
   * Chuyển đổi response thành định dạng thành công
   * @param {Object} data - Dữ liệu trả về
   * @param {string} message - Thông báo thành công
   * @returns {Object} Object chứa dữ liệu thành công
   */
  static success(data = {}, message = "Success") {
    return dtoResponse.success(data, message);
  }
}

module.exports = ThumbnailDto; 