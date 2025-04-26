"use strict";
//----------------------------------------------------------------
const dtoResponse = require("../../../shared/helper/dtoResponse");

/**
 * DTO cho tính năng quản lý bạn bè
 */
class FriendDto {
  /**
   * Chuyển đổi dữ liệu bạn bè sang định dạng trả về
   * @param {Object} friend - Dữ liệu người dùng (bạn bè)
   * @returns {Object} - Dữ liệu đã định dạng
   */
  static toResponse(friend) {
    return {
      id: friend._id || friend.id,
      fullName: friend.fullName || '',
      profilePicture: friend.profilePicture || '',
      email: friend.email || '',
      bio: friend.bio || ''
    };
  }

  /**
   * Chuyển đổi danh sách bạn bè sang định dạng trả về
   * @param {Array} friends - Danh sách bạn bè
   * @returns {Array} - Danh sách đã định dạng
   */
  static toResponseList(friends) {
    return friends.map(friend => this.toResponse(friend));
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

module.exports = FriendDto; 