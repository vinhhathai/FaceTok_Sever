"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");
const { getPublicUserId } = require("../../../shared/utils/securityHelper");

/**
 * DTO cho xử lý dữ liệu profile người dùng
 */
class ProfileDto {
  
  /**
   * Format dữ liệu response cho profile
   * @param {Object} user - Dữ liệu người dùng
   * @param {boolean} isOwner - Có phải chủ profile không
   * @returns {Object} Dữ liệu profile đã được format
   */
  static toResponse(user, isOwner = false) {
    // Determine if personal info should be shown
    // Always show to owner, otherwise check privacy setting
    const showPersonalInfo = isOwner || (user.showPersonalInfo !== false);
    
    return {
      id: getPublicUserId(user), // Dùng ObjectId trên toàn hệ thống
      fullName: user.fullName,
      email: showPersonalInfo ? (isOwner ? user.email : "") : null,
      profilePicture: user.profilePicture || "",
      thumbnail: user.thumbnail || "",
      birthday: showPersonalInfo ? (user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : null) : null,
      bio: user.bio || "",
      gender: showPersonalInfo ? user.gender : null,
      createdAt: null, // Hide "Joined date" completely as requested
      updatedAt: user.updatedAt,
      location: showPersonalInfo ? (user.location || "No location") : null,
      relationship: showPersonalInfo ? (user.relationship || "") : null,
      showPersonalInfo: user.showPersonalInfo !== false, // Include privacy setting
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