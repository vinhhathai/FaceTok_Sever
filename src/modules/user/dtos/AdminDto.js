"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");
const { getPublicUserId } = require("../../../shared/utils/securityHelper");

/**
 * DTO cho xử lý dữ liệu admin
 */
class AdminDto {
  
  /**
   * Format dữ liệu response cho user trong admin panel
   * @param {Object} user - Dữ liệu người dùng
   * @returns {Object} Dữ liệu user đã được format
   */
  static toUserResponse(user) {
    return {
      id: getPublicUserId(user),
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture || "",
      thumbnail: user.thumbnail || "",
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : null,
      gender: user.gender,
      location: user.location || "",
      bio: user.bio || "",
      relationship: user.relationship || "",
      termsAcceptance: {
        accepted: user.termsAcceptance?.accepted || false,
        acceptedAt: user.termsAcceptance?.acceptedAt || null,
        version: user.termsAcceptance?.version || null,
        ipAddress: user.termsAcceptance?.ipAddress || null
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
  static success(data, message = "Success") {
    return dtoResponse.success(data, message);
  }
}

module.exports = AdminDto;
