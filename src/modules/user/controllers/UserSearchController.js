"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { UserSearchService } = require("../services");
const { UserSearchDto } = require("../dtos");
const { userSearchValidation } = require("../validations");

/**
 * Controller xử lý các chức năng liên quan đến tìm kiếm người dùng
 */
class UserSearchController {
  constructor() {
    this.userSearchService = new UserSearchService();
  }

  /**
   * Tìm kiếm người dùng theo từ khóa
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  searchUsers = async (req, res) => {
    try {
      console.log("Search users request received");

      // Dữ liệu từ query parameters (cho GET request)
      const searchData = {
        query: req.query.query,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      // Validate thông tin đầu vào
      const { error, value } = userSearchValidation(searchData);
      if (error) {
        return res.status(400).json(
          UserSearchDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }


      // Gọi service để tìm kiếm người dùng
      const result = await this.userSearchService.searchUsers(
        value.query, 
        value.page, 
        value.limit,
        req.user?.id
      );

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
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
        ...result
      });
    } catch (error) {
      console.error("Error in searchUsers controller:", error);
      return res.status(500).json(
        UserSearchDto.error(
          errorCode.SEARCH_USERS_FAILED,
          error.message || "Lỗi khi tìm kiếm người dùng"
        )
      );
    }
  };
}

module.exports = UserSearchController; 