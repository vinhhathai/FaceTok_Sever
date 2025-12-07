"use strict";
//----------------------------------------------------------------
const mongoose = require('mongoose');
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FullnameDto } = require("../dtos");

/**
 * Service for handling user fullname operations
 */
class FullnameService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Update user's fullname
   * @param {string} userId - ID of the user to update
   * @param {string} fullName - New fullname
   * @returns {Promise<Object>} Result of fullname update
   */
  async updateFullName(userId, fullName) {
    try {
      // Validate userId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return FullnameDto.error(
          errorCode.VALIDATION_FAILED,
          "Invalid user ID"
        );
      }

      // Validate fullName
      if (!fullName || fullName.trim() === '') {
        return FullnameDto.error(
          errorCode.VALIDATION_FAILED,
          "Fullname cannot be empty"
        );
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return FullnameDto.error(
          errorCode.DATA_NOT_FOUND,
          errorMessage.USER_NOT_FOUND
        );
      }

      // Check last update time
      const lastNameUpdateTime = existingUser.lastNameUpdateTime || new Date(0); // If none, use epoch time
      const currentTime = new Date();
      const timeDiffMs = currentTime.getTime() - lastNameUpdateTime.getTime();
      const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));
      
      // Check if 60 minutes have passed since last name update
      if (timeDiffMinutes < 60) {
        const timeRemaining = 60 - timeDiffMinutes;
        return FullnameDto.error(
          errorCode.NAME_UPDATE_TIME_LIMIT,
          `You need to wait ${timeRemaining} more minutes to update your name`,
          { timeRemaining }
        );
      }
      
      // Update fullname
      const updatedUser = await this.userRepository.updateFullName(userId, fullName, currentTime);
      
      // Check update result
      if (!updatedUser) {
        return FullnameDto.error(
          errorCode.ERR_UPDATE_PROFILE_FAILED,
          "Could not update fullname"
        );
      }

      // Format response data with DTO
      const responseData = FullnameDto.toResponse(updatedUser);

      // Calculate next available update time
      let nextNameUpdateAvailable;
      if (updatedUser.lastNameUpdateTime) {
        nextNameUpdateAvailable = new Date(updatedUser.lastNameUpdateTime.getTime() + 60 * 60 * 1000);
      } else {
        nextNameUpdateAvailable = new Date(currentTime.getTime() + 60 * 60 * 1000);
      }
      
      responseData.nextNameUpdateAvailable = nextNameUpdateAvailable;

      // Return success result
      return FullnameDto.success(responseData, "Fullname updated successfully");
    } catch (error) {
      console.error("Error in updateFullName service:", error);
      return FullnameDto.error(
        errorCode.ERR_UPDATE_PROFILE_FAILED,
        "Error updating fullname",
        error.message
      );
    }
  }
}

module.exports = FullnameService; 