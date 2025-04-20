"use strict";
//----------------------------------------------------------------
const dtoResponse = require("../../../shared/helper/dtoResponse");

/**
 * DTO cho tính năng tìm kiếm người dùng
 */
class UserSearchDto {
  /**
   * Chuyển đổi dữ liệu người dùng sang định dạng trả về kết quả tìm kiếm
   * @param {Object} user - Dữ liệu người dùng
   * @returns {Object} - Dữ liệu đã định dạng
   */
  static toResponse(user) {
    return {
      id: user._id || user.id,
      fullName: user.fullName || '',
      profilePicture: user.profilePicture || '',
      thumbnailPicture: user.thumbnailPicture || '',
      bio: user.bio || '',
      // Trường username đã bị loại bỏ để phù hợp với kiến trúc cũ
    };
  }

  /**
   * Chuyển đổi danh sách người dùng sang định dạng trả về kết quả tìm kiếm
   * @param {Array} users - Danh sách người dùng
   * @returns {Array} - Danh sách đã định dạng
   */
  static toResponseList(users) {
    return users.map(user => this.toResponse(user));
  }

  /**
   * Tạo phản hồi lỗi
   * @param {String} code - Mã lỗi
   * @param {String} message - Thông báo lỗi
   * @param {String} detail - Chi tiết lỗi
   * @returns {Object} - Object lỗi
   */
  static error(code, message, detail) {
    return dtoResponse.error(code, message, detail);
  }

  /**
   * Tạo phản hồi thành công
   * @param {Object} data - Dữ liệu trả về
   * @param {String} message - Thông báo
   * @returns {Object} - Object thành công
   */
  static success(data, message) {
    return dtoResponse.success(data, message);
  }
}

module.exports = UserSearchDto; 