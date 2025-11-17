"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { UserSearchDto } = require("../dtos");

/**
 * Service for handling user search functionality
 */
class UserSearchService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Search for users by keyword
   * @param {string} query - Search keyword
   * @param {number} page - Current page number
   * @param {number} limit - Number of results per page
   * @param {string} currentUserId - ID of current user (to exclude from results)
   * @returns {Promise<Object>} List of users found
   */
  async searchUsers(query, page = 1, limit = 10, currentUserId = null) {
    try {
      // Validate input parameters
      if (!query || query.trim() === '') {
        console.log(`[UserSearchService] Invalid search keyword`);
        return UserSearchDto.error(
          errorCode.VALIDATION_FAILED,
          "Search keyword cannot be empty"
        );
      }

      // Handle pagination
      const skip = (page - 1) * limit;
      
      // Optimize search query with proper indexing support
      const searchCondition = {
        $or: [
          { fullName: { $regex: query, $options: 'i' } }, // Case-insensitive name search
          { email: { $regex: query, $options: 'i' } }     // Case-insensitive email search
        ],
        // Chỉ trả về tài khoản đang hoạt động và đã xác thực email
        isActive: true,
        isEmailVerified: true,
      };
      
      // Exclude current user from search results if provided
      if (currentUserId) {
        searchCondition._id = { $ne: currentUserId };
      }
      
      // Select only necessary fields to optimize performance
      const projection = { 
        _id: 1,
        fullName: 1, 
        email: 1, 
        profilePicture: 1, 
        thumbnailPicture: 1, 
        bio: 1
      };
      
      // Execute search query with pagination
      const users = await this.userRepository.findByCondition(
        searchCondition,
        projection,
        { 
          skip, 
          limit,
          sort: { fullName: 1 } // Sort by name A-Z
        }
      );
      
      // Count total results for pagination metadata
      const total = await this.userRepository.countByCondition(searchCondition);
      
      console.log(`[UserSearchService] Found ${users.length} users (total ${total} results)`);

      // Format response data using DTO
      const formattedUsers = UserSearchDto.toResponseList(users);
      
      // Create pagination metadata
      const pagination = {
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total
      };

      // Return successful response
      return UserSearchDto.success(
        { 
          users: formattedUsers,
          pagination
        }, 
        "User search completed successfully"
      );
    } catch (error) {
      console.error("Error in searchUsers service:", error);
      return UserSearchDto.error(
        errorCode.SEARCH_USERS_FAILED,
        "Error when searching for users",
        error.message
      );
    }
  }
}

module.exports = UserSearchService;