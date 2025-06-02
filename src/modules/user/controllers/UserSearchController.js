"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { UserSearchService } = require("../services");
const { UserSearchDto } = require("../dtos");
const { userSearchValidation } = require("../validations");

/**
 * Controller for handling user search functionality
 */
class UserSearchController {
  constructor() {
    this.userSearchService = new UserSearchService();
  }

  /**
   * Search for users by keyword
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  searchUsers = async (req, res) => {
    try {
      console.log("Search users request received");

      // Extract data from query parameters
      const searchData = {
        query: req.query.query,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      // Validate input data
      const { error, value } = userSearchValidation(searchData);
      if (error) {
        return res.status(400).json(
          UserSearchDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }

      // Call service to search for users
      const result = await this.userSearchService.searchUsers(
        value.query, 
        value.page, 
        value.limit,
        req.user?.id
      );

      // Check result and return appropriate response
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

      // Return successful response
      return res.status(200).json({
        ...result
      });
    } catch (error) {
      console.error("Error in searchUsers controller:", error);
      return res.status(500).json(
        UserSearchDto.error(
          errorCode.SEARCH_USERS_FAILED,
          error.message || "Error when searching for users"
        )
      );
    }
  };
}

module.exports = UserSearchController; 