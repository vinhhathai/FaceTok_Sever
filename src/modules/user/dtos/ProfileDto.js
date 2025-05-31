"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO cho xử lý dữ liệu profile người dùng
 */
class ProfileDto {
  
  /**
   * Format dữ liệu response cho profile
   * @param {Object} user - Dữ liệu người dùng
   * @returns {Object} Dữ liệu profile đã được format
   */
  static toResponse(user, isOwner = false) {
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture || "",
      thumbnail: user.thumbnail || "",
      birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : null,
      bio: user.bio || "",
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      location: user.location || "No location",
      relationship: user.relationship || "",
      ...(isOwner && { isOwner: true }),
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

module.exports = ProfileDto; 