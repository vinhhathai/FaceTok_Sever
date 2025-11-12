"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const UserRepository = require("../repositories/UserRepository");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AdminDto } = require("../dtos");

/**
 * Service xử lý các chức năng admin
 */
class AdminService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Lấy danh sách tất cả users với phân trang và filter
   * @param {Object} params - Parameters for filtering and pagination
   * @returns {Promise<Object>} Danh sách users và pagination info
   */
  async getAllUsers({ page = 1, limit = 10, search = "", role = "", isActive, isEmailVerified }) {
    try {
      // Build filter query
      const filter = {};
      
      // Search by fullName or email
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }
      
      // Filter by role
      if (role) {
        filter.role = role;
      }
      
      // Filter by active status
      if (isActive !== undefined && isActive !== null && isActive !== "") {
        filter.isActive = isActive === "true" || isActive === true;
      }

      // Filter by email verification status
      if (isEmailVerified !== undefined && isEmailVerified !== null && isEmailVerified !== "") {
        filter.isEmailVerified = isEmailVerified === "true" || isEmailVerified === true;
      }

      console.log("MongoDB Filter Query:", JSON.stringify(filter, null, 2));

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.userRepository.countDocuments(filter);

      // Get users with pagination
      const users = await this.userRepository.findAll(
        filter,
        {
          password: 0,
          refreshToken: 0,
          emailVerificationToken: 0,
          passwordResetToken: 0,
        },
        {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      );

      // Format users data
      const formattedUsers = users.map(user => AdminDto.toUserResponse(user));

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return AdminDto.success(
        {
          users: formattedUsers,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage
          }
        },
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting all users:", error);
      return AdminDto.error(
        errorCode.ERR_RETRIEVE_USERS_FAILED,
        "Error retrieving users",
        error.message
      );
    }
  }

  /**
   * Lấy thống kê users
   * @returns {Promise<Object>} Statistics data
   */
  async getUserStatistics() {
    try {
      // Total users
      const totalUsers = await this.userRepository.countDocuments({});
      
      // Active users
      const activeUsers = await this.userRepository.countDocuments({ isActive: true });
      
      // Inactive users
      const inactiveUsers = await this.userRepository.countDocuments({ isActive: false });
      
      // Users by role
      const adminCount = await this.userRepository.countDocuments({ role: "admin" });
      const staffCount = await this.userRepository.countDocuments({ role: "staff" });
      const memberCount = await this.userRepository.countDocuments({ role: "member" });
      
      // New users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const newUsersThisMonth = await this.userRepository.countDocuments({
        createdAt: { $gte: startOfMonth }
      });

      return AdminDto.success(
        {
          totalUsers,
          activeUsers,
          inactiveUsers,
          usersByRole: {
            admin: adminCount,
            staff: staffCount,
            member: memberCount
          },
          newUsersThisMonth
        },
        "Statistics retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting user statistics:", error);
      return AdminDto.error(
        errorCode.ERR_RETRIEVE_STATISTICS_FAILED,
        "Error retrieving statistics",
        error.message
      );
    }
  }

  /**
   * Ban user (set isActive to false)
   * @param {string} userId - User ID to ban
   * @param {string} adminId - Admin ID performing the action
   * @returns {Promise<Object>} Result
   */
  async banUser(userId, adminId) {
    try {
      // Check if user exists
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return AdminDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }

      // Cannot ban admin or staff
      if (user.role === "admin" || user.role === "staff") {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot ban admin or staff users"
        );
      }

      // Cannot ban yourself
      if (userId === adminId) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot ban yourself"
        );
      }

      // Check if already banned
      if (!user.isActive) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "User is already banned"
        );
      }

      // Ban user
      const updatedUser = await this.userRepository.update(userId, { 
        isActive: false,
        bannedAt: new Date(),
        bannedBy: adminId
      });

      return AdminDto.success(
        { user: AdminDto.toUserResponse(updatedUser) },
        "User banned successfully"
      );
    } catch (error) {
      console.error("Error banning user:", error);
      return AdminDto.error(
        errorCode.ERR_BAN_USER_FAILED,
        "Error banning user",
        error.message
      );
    }
  }

  /**
   * Unban user (set isActive to true)
   * @param {string} userId - User ID to unban
   * @param {string} adminId - Admin ID performing the action
   * @returns {Promise<Object>} Result
   */
  async unbanUser(userId, adminId) {
    try {
      // Check if user exists
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return AdminDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }

      // Check if already active
      if (user.isActive) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "User is already active"
        );
      }

      // Unban user
      const updatedUser = await this.userRepository.update(userId, { 
        isActive: true,
        unbannedAt: new Date(),
        unbannedBy: adminId
      });

      return AdminDto.success(
        { user: AdminDto.toUserResponse(updatedUser) },
        "User unbanned successfully"
      );
    } catch (error) {
      console.error("Error unbanning user:", error);
      return AdminDto.error(
        errorCode.ERR_UNBAN_USER_FAILED,
        "Error unbanning user",
        error.message
      );
    }
  }

  /**
   * Delete user permanently
   * @param {string} userId - User ID to delete
   * @param {string} adminId - Admin ID performing the action
   * @returns {Promise<Object>} Result
   */
  async deleteUser(userId, adminId) {
    try {
      // Check if user exists
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return AdminDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }

      // Cannot delete admin or staff
      if (user.role === "admin" || user.role === "staff") {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot delete admin or staff users"
        );
      }

      // Cannot delete yourself
      if (userId === adminId) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "Cannot delete yourself"
        );
      }

      // Delete user (you might want to soft delete instead)
      await this.userRepository.delete(userId);

      return AdminDto.success(
        { userId },
        "User deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      return AdminDto.error(
        errorCode.ERR_DELETE_USER_FAILED,
        "Error deleting user",
        error.message
      );
    }
  }

  /**
   * Send email to user
   * @param {string} userId - User ID to send email to
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @param {string} adminId - Admin ID performing the action
   * @returns {Promise<Object>} Result
   */
  async sendEmailToUser(userId, subject, message, adminId) {
    try {
      // Check if user exists
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return AdminDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found"
        );
      }

      // Check if user has email
      if (!user.email) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "User does not have an email address"
        );
      }

      // Import EmailService
      const EmailService = require("../../../shared/services/EmailService");

      // Send email
      await EmailService.sendAdminEmail(
        user.email,
        subject,
        message,
        user.fullName
      );

      return AdminDto.success(
        { 
          userId,
          email: user.email,
          subject 
        },
        "Email sent successfully"
      );
    } catch (error) {
      console.error("Error sending email to user:", error);
      return AdminDto.error(
        errorCode.ERR_SEND_EMAIL_FAILED,
        "Error sending email",
        error.message
      );
    }
  }

  /**
   * Update user role (Admin only)
   * @param {string} userId - ID of user to update
   * @param {string} newRole - New role ('member' or 'staff')
   * @param {string} adminId - ID of admin performing the action
   * @returns {Promise<Object>} Updated user info
   */
  async updateUserRole(userId, newRole, adminId) {
    try {
      // Validate userId exists
      if (!userId) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "User ID is required",
          { userId }
        );
      }

      // Validate role - Only allow member or staff
      if (!['member', 'staff'].includes(newRole)) {
        return AdminDto.error(
          errorCode.VALIDATION_FAILED,
          "Role must be 'member' or 'staff' only",
          { role: newRole }
        );
      }

      // Find user to update - try by publicId first (UUID), then by _id (ObjectId)
      let user = await this.userRepository.findOne({ publicId: userId });
      if (!user) {
        // Try finding by _id for newer users with ObjectId
        try {
          user = await this.userRepository.findById(userId);
        } catch (err) {
          // Silently fail and return null
        }
      }
      
      if (!user) {
        return AdminDto.error(
          errorCode.DATA_NOT_FOUND,
          "User not found",
          { userId }
        );
      }

      // Check if trying to update own role (admin cannot change their own role)
      // Compare with both _id and publicId
      const userIdentifier = user._id.toString() || user.publicId;
      if (userId === adminId || userIdentifier === adminId || user.publicId === adminId) {
        return AdminDto.error(
          errorCode.FORBIDDEN,
          "Cannot change your own role",
          { userId }
        );
      }

      // Update role
      user.role = newRole;
      await user.save();

      // Return updated user info
      return AdminDto.success(
        {
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          updatedAt: user.updatedAt
        },
        "User role updated successfully"
      );

    } catch (error) {
      console.error("Error updating user role:", error);
      return AdminDto.error(
        errorCode.INTERNAL_SERVER_ERROR,
        "Error updating user role",
        error.message
      );
    }
  }
}

module.exports = AdminService;
