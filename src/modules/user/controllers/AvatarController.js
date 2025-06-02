"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AvatarService } = require("../services");
const { AvatarDto } = require("../dtos");

/**
 * Controller for user avatar related functionalities
 */
class AvatarController {
  constructor() {
    this.avatarService = new AvatarService();
  }

  /**
   * Update user avatar from file upload
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  updateAvatar = async (req, res) => {
    try {
      const file = req.file;
      const userId = req.user.id;

      // Call service to handle all the processing and updating
      const result = await this.avatarService.updateAvatar(
        userId,
        file
      );

      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Error in updateAvatar controller:", error);
      return res.status(500).json({
        ...AvatarDto.error(
          errorCode.ERR_UPDATE_AVATAR_FAILED,
          error.message || "Failed to update profile picture",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = AvatarController; 