"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ProfileService } = require("../services");
const { ProfileDto } = require("../dtos");
const {
  profileValidation,
  updateProfileValidation,
  blockUserValidation,
} = require("../validations");
const {
  processAndUploadImage,
} = require("../../../shared/utils/cloudinaryUpload");

/**
 * Controller xử lý các chức năng liên quan đến profile người dùng
 */
class ProfileController {
  constructor() {
    this.profileService = new ProfileService();
  }

  getBlockedUsers = async (req, res) => {
    try {
      const userId = req.user?.id;
      const result = await this.profileService.getBlockedUsers(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        ...ProfileDto.error(
          errorCode.ERR_RETRIEVE_PROFILE_FAILED,
          error.message || "Lỗi khi lấy danh sách người dùng đã chặn",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  unblockUser = async (req, res) => {
    try {
      const userId = req.user?.id;
      const blockedUserId = req.body.blockedUserId;
      
      const { error, value } = await blockUserValidation({ blockedUserId });
      if (error) {
        return res
          .status(400)
          .json(
            ProfileDto.error(
              errorCode.VALIDATION_FAILED,
              error.details[0].message
            )
          );
      }
      
      const result = await this.profileService.unblockUser(userId, value.blockedUserId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        ...ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          error.message || "Lỗi khi bỏ chặn người dùng",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  blockUser = async (req, res) => {
    try {
      const userId = req.user?.id;
      const blockedUserId = req.body.blockedUserId;

      const { error, value } = await blockUserValidation({ blockedUserId });
      if (error) {
        return res
          .status(400)
          .json(
            ProfileDto.error(
              errorCode.VALIDATION_FAILED,
              error.details[0].message
            )
          );
      }

      const result = await this.profileService.blockUser(
        userId,
        value.blockedUserId
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        ...ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          error.message || "Lỗi khi chặn người dùng",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  getProfile = async (req, res) => {
    try {
      // Lấy ID người dùng đang đăng nhập từ token
      const logingUserId = req.user?.id;

      // Lấy ID người dùng cần xem profile từ params
      const viewingUserId = req.params.id;

      const { error, value } = profileValidation({
        userId: viewingUserId,
      });

      if (error) {
        return res
          .status(400)
          .json(
            ProfileDto.error(
              errorCode.VALIDATION_FAILED,
              error.details[0].message
            )
          );
      }

      let result = null;

      if (value) {
        result = await this.profileService.getProfile(
          viewingUserId,
          logingUserId
        );
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        ...ProfileDto.error(
          errorCode.ERR_RETRIEVE_PROFILE_FAILED,
          error.message || "Lỗi khi lấy thông tin profile",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Update user profile information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateProfile = async (req, res) => {
    try {
      // Get authenticated user ID from token
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(
            ProfileDto.error(
              errorCode.AUTHENTICATION_FAILED,
              "Authentication required"
            )
          );
      }

      // Validate request data
      const { error, value } = updateProfileValidation(req.body);
      if (error) {
        return res
          .status(400)
          .json(
            ProfileDto.error(
              errorCode.VALIDATION_FAILED,
              error.details.map((d) => d.message).join(", ")
            )
          );
      }

      console.log("Profile update - received data:", value);

      // Update profile through service
      const result = await this.profileService.updateProfile(userId, value);

      // Handle different response scenarios
      if (!result.success) {
        const statusCodes = {
          [errorCode.DATA_NOT_FOUND]: 404,
          [errorCode.VALIDATION_FAILED]: 400,
          [errorCode.UPDATE_PROFILE_FAILED]: 500,
        };

        const status = result.error?.code
          ? statusCodes[result.error.code] || 500
          : 500;

        return res.status(status).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      // Return success response
      return res.status(200).json(result);
    } catch (error) {
      console.error("ProfileController.updateProfile error:", error);
      return res
        .status(500)
        .json(
          ProfileDto.error(
            errorCode.UPDATE_PROFILE_FAILED,
            "Failed to update profile"
          )
        );
    }
  };
}

module.exports = ProfileController;
