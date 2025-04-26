"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { UserSearchDto } = require("../dtos");

/**
 * Service xử lý các chức năng liên quan đến tìm kiếm người dùng
 */
class UserSearchService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Tìm kiếm người dùng theo từ khóa
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số lượng kết quả trên mỗi trang
   * @param {string} currentUserId - ID của người dùng hiện tại (để loại bỏ khỏi kết quả)
   * @returns {Promise<Object>} Danh sách người dùng tìm thấy
   */
  async searchUsers(query, page = 1, limit = 20, currentUserId = null) {
    try {
      
      // Kiểm tra tính hợp lệ của tham số
      if (!query || query.trim() === '') {
        console.log(`[UserSearchService] Từ khóa tìm kiếm không hợp lệ`);
        return UserSearchDto.error(
          errorCode.VALIDATION_FAILED,
          "Từ khóa tìm kiếm không được để trống"
        );
      }

      // Xử lý phân trang
      const skip = (page - 1) * limit;
      
      // Tạo điều kiện tìm kiếm (phù hợp với kiến trúc cũ)
      const searchCondition = {
        $or: [
          { fullName: { $regex: query, $options: 'i' } }, // Tìm theo tên, không phân biệt chữ hoa/thường
          { email: { $regex: query, $options: 'i' } }     // Tìm theo email
        ]
      };
      
      // Loại bỏ người dùng hiện tại khỏi kết quả tìm kiếm
      if (currentUserId) {
        searchCondition._id = { $ne: currentUserId };
      }
      
      // Chỉ lấy các trường phù hợp với kiến trúc cũ - chỉ sử dụng inclusion (không sử dụng exclusion)
      const projection = { 
        _id: 1,
        fullName: 1, 
        email: 1, 
        profilePicture: 1, 
        thumbnailPicture: 1, 
        bio: 1
      };
      
      // Lấy danh sách người dùng phù hợp với điều kiện tìm kiếm
      const users = await this.userRepository.findByCondition(
        searchCondition,
        projection,
        { 
          skip, 
          limit,
          sort: { fullName: 1 } // Sắp xếp theo tên A-Z
        }
      );
      
      // Đếm tổng số kết quả để phục vụ phân trang
      const total = await this.userRepository.countByCondition(searchCondition);
      
      console.log(`[UserSearchService] Tìm thấy ${users.length} người dùng (tổng ${total} kết quả)`);

      // Format dữ liệu trả về bằng DTO
      const formattedUsers = UserSearchDto.toResponseList(users);
      
      // Tạo metadata cho phân trang
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        resultsPerPage: limit
      };

      // Trả về kết quả thành công
      return UserSearchDto.success(
        { 
          users: formattedUsers,
          pagination
        }, 
        "Tìm kiếm người dùng thành công"
      );
    } catch (error) {
      console.error("Error in searchUsers service:", error);
      return UserSearchDto.error(
        errorCode.SEARCH_USERS_FAILED,
        "Lỗi khi tìm kiếm người dùng",
        error.message
      );
    }
  }
}

module.exports = UserSearchService; 