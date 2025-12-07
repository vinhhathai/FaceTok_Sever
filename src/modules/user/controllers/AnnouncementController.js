"use strict";
//----------------------------------------------------------------
const { errorCode } = require("../../../shared/common/error");
const AnnouncementService = require("../services/AnnouncementService");
const { processAndUploadImage, deleteFromCloudinary } = require("../../../shared/utils/cloudinaryUpload");

/**
 * Controller xử lý announcement operations
 */
class AnnouncementController {
  constructor() {
    this.announcementService = new AnnouncementService();
  }

  /**
   * Create a new announcement (Admin only)
   */
  createAnnouncement = async (req, res) => {
    try {
      console.log("Create announcement request received");
      
      const { title, message, type, targetAudience, startsAt, expiresAt } = req.body;
      const createdBy = req.user?.id || req.userId; // From checkAdmin middleware

      // Validation
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          error: {
            code: errorCode.VALIDATION_FAILED,
            message: "Title and message are required"
          },
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      if (!createdBy) {
        return res.status(401).json({
          success: false,
          error: {
            code: errorCode.UNAUTHORIZED,
            message: "User authentication required"
          },
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Handle image upload if present
      let imageUrl = "";
      let imagePublicId = "";
      
      if (req.file) {
        try {
          const uploadResult = await processAndUploadImage(
            req.file.buffer,
            'chaotok/announcements',
            { quality: 85, width: 800, height: 600, fit: 'inside' },
            { resource_type: 'image' }
          );
          imageUrl = uploadResult.secure_url;
          imagePublicId = uploadResult.public_id;
        } catch (uploadError) {
          console.error("Error uploading announcement image:", uploadError);
          return res.status(500).json({
            success: false,
            error: {
              code: errorCode.INTERNAL_SERVER_ERROR,
              message: "Failed to upload image"
            },
            path: req.originalUrl,
            timestamp: new Date().toISOString()
          });
        }
      }

      const result = await this.announcementService.createAnnouncement({
        title,
        message,
        type,
        targetAudience,
        createdBy,
        startsAt,
        expiresAt,
        image: imageUrl,
        imagePublicId: imagePublicId
      });

      if (!result.success) {
        // If announcement creation failed but image was uploaded, delete the image
        if (imagePublicId) {
          await deleteFromCloudinary(imagePublicId);
        }
        return res.status(500).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(201).json({
        ...result,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in createAnnouncement:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          details: error.message
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Get all announcements (Admin only)
   */
  getAllAnnouncements = async (req, res) => {
    try {
      console.log("Get all announcements request received");

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const isActive = req.query.isActive;
      const type = req.query.type;
      const targetAudience = req.query.targetAudience;

      const result = await this.announcementService.getAllAnnouncements({
        page,
        limit,
        isActive,
        type,
        targetAudience
      });

      if (!result.success) {
        return res.status(500).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        ...result,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in getAllAnnouncements:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          details: error.message
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Get announcement by ID
   */
  getAnnouncementById = async (req, res) => {
    try {
      const { id } = req.params;

      const result = await this.announcementService.getAnnouncementById(id);

      if (!result.success) {
        const statusCode = result.error.code === errorCode.ERR_ANNOUNCEMENT_NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        ...result,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in getAnnouncementById:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          details: error.message
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Update announcement (Admin only)
   */
  updateAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Handle new image upload if present
      if (req.file) {
        try {
          // Get current announcement to delete old image if exists
          const currentAnnouncement = await this.announcementService.getAnnouncementById(id);
          
          // Upload new image
          const uploadResult = await processAndUploadImage(
            req.file.buffer,
            'chaotok/announcements',
            { quality: 85, width: 800, height: 600, fit: 'inside' },
            { resource_type: 'image' }
          );
          
          updateData.image = uploadResult.secure_url;
          updateData.imagePublicId = uploadResult.public_id;
          
          // Delete old image if exists
          if (currentAnnouncement.success && currentAnnouncement.data.imagePublicId) {
            await deleteFromCloudinary(currentAnnouncement.data.imagePublicId);
          }
        } catch (uploadError) {
          console.error("Error uploading announcement image:", uploadError);
          return res.status(500).json({
            success: false,
            error: {
              code: errorCode.INTERNAL_SERVER_ERROR,
              message: "Failed to upload image"
            },
            path: req.originalUrl,
            timestamp: new Date().toISOString()
          });
        }
      }

      const result = await this.announcementService.updateAnnouncement(id, updateData);

      if (!result.success) {
        const statusCode = result.error.code === errorCode.ERR_ANNOUNCEMENT_NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        ...result,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in updateAnnouncement:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          details: error.message
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Delete announcement (Admin only)
   */
  deleteAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;

      const result = await this.announcementService.deleteAnnouncement(id);

      if (!result.success) {
        const statusCode = result.error.code === errorCode.ERR_ANNOUNCEMENT_NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        ...result,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in deleteAnnouncement:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          details: error.message
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Get active announcements for current user based on role
   */
  getActiveAnnouncements = async (req, res) => {
    try {
      const user = req.user; // Assuming user object is attached by middleware
      const userRole = user?.role || 'member'; // Default to member

      const result = await this.announcementService.getActiveAnnouncementsForUser(userRole);

      if (!result.success) {
        return res.status(500).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        ...result,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in getActiveAnnouncements:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          details: error.message
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = AnnouncementController;
