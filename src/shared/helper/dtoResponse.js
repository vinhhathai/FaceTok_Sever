"use strict";
//----------------------------------------------------------------

/**
 * Helper chung cho các phương thức response của DTO
 */
class DTOResponse {
  /**
   * Tạo response lỗi
   * @param {string} code - Mã lỗi
   * @param {string} message - Thông báo lỗi
   * @param {string} detail - Chi tiết lỗi (tùy chọn)
   * @returns {Object} - Đối tượng response lỗi
   */
  static error(code, message, detail = null) {
    const response = {
      success: false,
      error: {
        code,
        message,
      },
    };

    if (detail) {
      response.error.detail = detail;
    }

    return response;
  }

  /**
   * Tạo response thành công
   * @param {Object} data - Dữ liệu trả về
   * @param {string} message - Thông báo thành công
   * @returns {Object} - Đối tượng response thành công
   */
  static success(data = {}, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }
}

module.exports = DTOResponse; 