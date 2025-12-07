"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AdminService } = require("../services");
const { AdminDto } = require("../dtos");

/**
 * Controller xử lý các chức năng admin
 */
class AdminController {
  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Lấy danh sách tất cả users (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllUsers = async (req, res) => {
    try {
      console.log("Get all users request received");

      // Extract pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const role = req.query.role || ""; // Filter by role
      const isActive = req.query.isActive; // Filter by active status
      const isEmailVerified = req.query.isEmailVerified; // Filter by email verification status

      console.log("Query params:", { page, limit, search, role, isActive, isEmailVerified });

      // Call service to get all users
      const result = await this.adminService.getAllUsers({
        page,
        limit,
        search,
        role,
        isActive,
        isEmailVerified
      });

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
      console.error("Error in getAllUsers controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.ERR_RETRIEVE_USERS_FAILED,
          error.message || "Error when retrieving users",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Get user statistics (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserStatistics = async (req, res) => {
    try {
      console.log("Get user statistics request received");

      // Call service to get statistics
      const result = await this.adminService.getUserStatistics();

      // Check result and return appropriate response
      if (!result.success) {
        return res.status(500).json({
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
      console.error("Error in getUserStatistics controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.ERR_RETRIEVE_STATISTICS_FAILED,
          error.message || "Error when retrieving statistics",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Ban user (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  banUser = async (req, res) => {
    try {
      console.log("Ban user request received");

      const userId = req.params.userId;
      const adminId = req.user?.id;

      if (!userId) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "User ID is required"
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Call service to ban user
      const result = await this.adminService.banUser(userId, adminId);

      // Check result and return appropriate response
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
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
      console.error("Error in banUser controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.ERR_BAN_USER_FAILED,
          error.message || "Error when banning user",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Unban user (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  unbanUser = async (req, res) => {
    try {
      console.log("Unban user request received");

      const userId = req.params.userId;
      const adminId = req.user?.id;

      if (!userId) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "User ID is required"
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Call service to unban user
      const result = await this.adminService.unbanUser(userId, adminId);

      // Check result and return appropriate response
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
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
      console.error("Error in unbanUser controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.ERR_UNBAN_USER_FAILED,
          error.message || "Error when unbanning user",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Delete user permanently (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteUser = async (req, res) => {
    try {
      console.log("Delete user request received");

      const userId = req.params.userId;
      const adminId = req.user?.id;

      if (!userId) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "User ID is required"
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Call service to delete user
      const result = await this.adminService.deleteUser(userId, adminId);

      // Check result and return appropriate response
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
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
      console.error("Error in deleteUser controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.ERR_DELETE_USER_FAILED,
          error.message || "Error when deleting user",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Send email to user (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  sendEmailToUser = async (req, res) => {
    try {
      console.log("Send email to user request received");

      const { userId, subject, message } = req.body;
      const adminId = req.user?.id;

      // Validation
      if (!userId || !subject || !message) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "User ID, subject and message are required"
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      if (subject.length > 200) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "Subject must not exceed 200 characters"
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      if (message.length > 2000) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "Message must not exceed 2000 characters"
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Call service to send email
      const result = await this.adminService.sendEmailToUser(userId, subject, message, adminId);

      // Check result and return appropriate response
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
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
      console.error("Error in sendEmailToUser controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.ERR_SEND_EMAIL_FAILED,
          error.message || "Error when sending email",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Update user role (Admin only)
   * Admin can change user role to 'member' or 'staff' only
   * Admin cannot change their own role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateUserRole = async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const adminId = req.user.id;

      // Validate role - Only allow member or staff
      if (!role || !['member', 'staff'].includes(role)) {
        return res.status(400).json({
          ...AdminDto.error(
            errorCode.VALIDATION_FAILED,
            "Role must be 'member' or 'staff' only",
            { role }
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Call service
      const result = await this.adminService.updateUserRole(userId, role, adminId);

      if (!result.success) {
        let statusCode = 500;
        
        if (result.error?.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error?.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        } else if (result.error?.code === errorCode.FORBIDDEN) {
          statusCode = 403;
        }

        return res.status(statusCode).json({
          ...AdminDto.error(
            result.error.code,
            result.error.message,
            result.error.detail
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Success response
      return res.status(200).json({
        ...AdminDto.success(
          result.data,
          "User role updated successfully"
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error in updateUserRole controller:", error);
      return res.status(500).json({
        ...AdminDto.error(
          errorCode.INTERNAL_SERVER_ERROR,
          error.message || "Error when updating user role",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = AdminController;
