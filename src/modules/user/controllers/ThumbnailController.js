"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ThumbnailService } = require("../services");
const { ThumbnailDto } = require("../dtos");
const { thumbnailValidation } = require("../validations");
const {
  processAndUploadImage,
} = require("../../../shared/utils/cloudinaryUpload");

/**
 * Controller handling user thumbnail/cover photo related functionalities
 */
class ThumbnailController {
  constructor() {
    this.thumbnailService = new ThumbnailService();
  }

  /**
   * Update user's cover photo
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  updateThumbnail = async (req, res) => {
    try {
      const file = req.file;
      const userId = req.user.id; // Get user ID from auth middleware

      const result = await this.thumbnailService.updateThumbnail(
        userId,
        file
      );

      return res.status(200).json({
        ...result,
      
      });
    } catch (error) {
      console.error("Error in updateCoverPhoto controller:", error);
      return res.status(500).json({
        ...ThumbnailDto.error(
          errorCode.UPDATE_THUMBNAIL_FAILED,
          error.message || "Failed to update cover photo",
          error.detail
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = ThumbnailController;
