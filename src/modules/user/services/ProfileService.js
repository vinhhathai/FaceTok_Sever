"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ProfileDto } = require("../dtos");

/**
 * Service xử lý các chức năng liên quan đến profile người dùng
 */
class ProfileService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getBlockedUsers(userId) {
    try {
      const result = await this.userRepository.getBlockedUsers(userId);
      
      if (!result) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }
      
      return ProfileDto.success(
        { blockedUsers: result.blockedUsers || [] },
        "Blocked users retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting blocked users:", error);
      return ProfileDto.error(
        errorCode.ERR_RETRIEVE_PROFILE_FAILED,
        "Error retrieving blocked users",
        error.message
      );
    }
  }

  async unblockUser(userId, blockedUserId) {
    try {
      // Check if both users exist
      const user = await this.userRepository.findById(userId);
      const blockedUser = await this.userRepository.findById(blockedUserId);
      
      if (!user) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }
      
      if (!blockedUser) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          "User to unblock not found"
        );
      }
      
      // Check if not blocked
      if (!user.blockedUsers || !user.blockedUsers.includes(blockedUserId)) {
        return ProfileDto.error(
          errorCode.VALIDATION_FAILED,
          "User is not blocked"
        );
      }
      
      const result = await this.userRepository.unblockUser(userId, blockedUserId);
      
      if (!result) {
        return ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          "Failed to unblock user"
        );
      }
      
      return ProfileDto.success(
        { blockedUserId },
        "User unblocked successfully"
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
      return ProfileDto.error(
        errorCode.UPDATE_PROFILE_FAILED,
        "Error unblocking user",
        error.message
      );
    }
  }

  async blockUser(userId, blockedUserId) {
    try {
      // Check if both users exist
      const user = await this.userRepository.findById(userId);
      const blockedUser = await this.userRepository.findById(blockedUserId);
      
      if (!user) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }
      
      if (!blockedUser) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          "User to block not found"
        );
      }
      
      // Prevent self-blocking
      if (userId === blockedUserId) {
        return ProfileDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot block yourself"
        );
      }
      
      // Check if already blocked
      if (user.blockedUsers && user.blockedUsers.includes(blockedUserId)) {
        return ProfileDto.error(
          errorCode.VALIDATION_FAILED,
          "User is already blocked"
        );
      }
      
      const result = await this.userRepository.blockUser(userId, blockedUserId);
      
      if (!result) {
        return ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          "Failed to block user"
        );
      }
      
      return ProfileDto.success(
        { blockedUserId },
        "User blocked successfully"
      );
    } catch (error) {
      console.error("Error blocking user:", error);
      return ProfileDto.error(
        errorCode.UPDATE_PROFILE_FAILED,
        "Error blocking user",
        error.message
      );
    }
  }

  async getProfile(viewingUserId, logingUserId) {
    try {
      // Tìm người dùng theo ID, loại bỏ password và __v
      const user = await this.userRepository.findById(viewingUserId, {
        password: 0,
        __v: 0,
      });

      // So sánh để xác định có phải chủ sở hữu không
      const isOwner = viewingUserId.toString() === logingUserId.toString();

      // Sử dụng DTO để format dữ liệu trả về
      const profileData = ProfileDto.toResponse(user, isOwner);

      // Trả về kết quả thành công
      return ProfileDto.success(
        profileData,
        "Lấy thông tin profile thành công"
      );
    } catch (error) {
      return ProfileDto.error(
        errorCode.ERR_RETRIEVE_PROFILE_FAILED,
        "Lỗi khi lấy thông tin profile",
        error.message
      );
    }
  }

  /**
   * Update user profile information
   * @param {string} userId - User ID to update
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Profile update result
   */
  async updateProfile(userId, profileData) {
    try {
      // Check userId validity
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return ProfileDto.error(
          errorCode.VALIDATION_FAILED,
          "Invalid user ID format"
        );
      }

      // Find existing user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return ProfileDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      // Prepare update data (only include provided fields)
      const updateData = Object.entries(profileData)
        .filter(([key, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
          // Special handling for birthday
          if (key === "birthday" && value) {
            acc[key] = new Date(value);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});

      // Skip update if no data provided
      if (Object.keys(updateData).length === 0) {
        return ProfileDto.success(
          ProfileDto.toResponse(user),
          "No changes to update"
        );
      }

      // Update profile
      const updatedUser = await this.userRepository.updateProfile(
        userId,
        updateData
      );
      if (!updatedUser) {
        return ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          "Failed to update profile"
        );
      }

      console.log("Updated user data (including relationship):", updatedUser);

      // Return success response with updated data
      return ProfileDto.success(
        ProfileDto.toResponse(updatedUser),
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(`Profile update error for user ${userId}:`, error);
      return ProfileDto.error(
        errorCode.UPDATE_PROFILE_FAILED,
        "Error updating profile",
        error.message
      );
    }
  }
}

module.exports = ProfileService;
