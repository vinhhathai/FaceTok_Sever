"use strict";
//----------------------------------------------------------------
const { MediaService } = require("../services");
const { MediaDto } = require("../dtos");
const { errorCode, errorMessage } = require("../../../shared/common/error");

class MediaController {
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Lấy tất cả media files (ảnh, video) của user từ posts
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getUserMedia = async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type } = req.query;

      // Validate userId
      if (!userId) {
        return res.status(400).json(
          MediaDto.error(errorCode.INVALID_INPUT, "User ID is required")
        );
      }

      // Get user media from service
      const result = await this.mediaService.getUserMedia({
        userId,
        page: parseInt(page),
        limit: parseInt(limit),
        type // 'image', 'video', or undefined for all
      });

      const formattedResult = MediaDto.toGalleryResponse(result);
      return res.status(200).json(
        MediaDto.success(formattedResult, "Media files retrieved successfully")
      );
    } catch (error) {
      console.error("Error in getUserMedia:", error);
      return res.status(500).json(
        MediaDto.error(errorCode.INTERNAL_SERVER_ERROR, "Failed to retrieve media files")
      );
    }
  };
}

module.exports = MediaController;