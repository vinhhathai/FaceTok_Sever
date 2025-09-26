"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO cho xử lý dữ liệu media gallery của user
 */
class MediaDto {
  
  /**
   * Format dữ liệu response cho media item
   * @param {Object} mediaItem - Dữ liệu media item
   * @returns {Object} Dữ liệu media đã được format
   */
  static toResponse(mediaItem) {
    if (!mediaItem) return null;
    
    return {
      id: mediaItem.id,
      postId: mediaItem.postId,
      type: mediaItem.type,
      url: mediaItem.url,
      publicId: mediaItem.publicId,
      createdAt: mediaItem.createdAt,
      postContent: mediaItem.postContent,
      author: mediaItem.author
    };
  }

  /**
   * Format dữ liệu response cho danh sách media
   * @param {Array} mediaList - Danh sách media items
   * @returns {Array} Danh sách media đã được format
   */
  static toResponseList(mediaList) {
    if (!mediaList || !Array.isArray(mediaList)) return [];
    
    return mediaList.map(media => this.toResponse(media));
  }

  /**
   * Format dữ liệu response cho media gallery với pagination
   * @param {Object} result - Kết quả từ service
   * @returns {Object} Dữ liệu gallery đã được format
   */
  static toGalleryResponse(result) {
    return {
      media: this.toResponseList(result.media),
      pagination: result.pagination
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

module.exports = MediaDto;