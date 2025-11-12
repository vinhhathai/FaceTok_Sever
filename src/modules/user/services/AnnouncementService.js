"use strict";
//----------------------------------------------------------------
const AnnouncementRepository = require("../repositories/AnnouncementRepository");
const { errorCode } = require("../../../shared/common/error");

/**
 * Service xử lý các chức năng announcement
 */
class AnnouncementService {
  constructor() {
    this.announcementRepository = new AnnouncementRepository();
  }

  /**
   * Create a new announcement (Admin only)
   */
  async createAnnouncement({ title, message, type, targetAudience, createdBy, expiresAt, image, imagePublicId }) {
    try {
      const announcementData = {
        title: title.trim(),
        message: message.trim(),
        type: type || 'info',
        targetAudience: targetAudience || 'all',
        createdBy,
        expiresAt: expiresAt || null,
        isActive: true,
        image: image || "",
        imagePublicId: imagePublicId || ""
      };

      const announcement = await this.announcementRepository.create(announcementData);

      return {
        success: true,
        data: announcement,
        message: "Announcement created successfully"
      };
    } catch (error) {
      console.error("Error creating announcement:", error);
      return {
        success: false,
        error: {
          code: errorCode.ERR_CREATE_ANNOUNCEMENT_FAILED,
          message: "Error creating announcement",
          details: error.message
        }
      };
    }
  }

  /**
   * Get all announcements with pagination
   */
  async getAllAnnouncements({ page = 1, limit = 10, isActive, type, targetAudience }) {
    try {
      const filter = {};
      
      if (isActive !== undefined && isActive !== null && isActive !== "") {
        filter.isActive = isActive === "true" || isActive === true;
      }
      
      if (type) {
        filter.type = type;
      }
      
      if (targetAudience) {
        filter.targetAudience = targetAudience;
      }

      const skip = (page - 1) * limit;
      const total = await this.announcementRepository.countDocuments(filter);

      const announcements = await this.announcementRepository.findAll(
        filter,
        {},
        {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      );

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          announcements,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        message: "Announcements retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting announcements:", error);
      return {
        success: false,
        error: {
          code: errorCode.ERR_RETRIEVE_ANNOUNCEMENTS_FAILED,
          message: "Error retrieving announcements",
          details: error.message
        }
      };
    }
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id) {
    try {
      const announcement = await this.announcementRepository.findById(id);
      
      if (!announcement) {
        return {
          success: false,
          error: {
            code: errorCode.ERR_ANNOUNCEMENT_NOT_FOUND,
            message: "Announcement not found"
          }
        };
      }

      return {
        success: true,
        data: announcement,
        message: "Announcement retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting announcement:", error);
      return {
        success: false,
        error: {
          code: errorCode.ERR_RETRIEVE_ANNOUNCEMENT_FAILED,
          message: "Error retrieving announcement",
          details: error.message
        }
      };
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id, updateData) {
    try {
      const announcement = await this.announcementRepository.findById(id);
      
      if (!announcement) {
        return {
          success: false,
          error: {
            code: errorCode.ERR_ANNOUNCEMENT_NOT_FOUND,
            message: "Announcement not found"
          }
        };
      }

      const updated = await this.announcementRepository.update(id, updateData);

      return {
        success: true,
        data: updated,
        message: "Announcement updated successfully"
      };
    } catch (error) {
      console.error("Error updating announcement:", error);
      return {
        success: false,
        error: {
          code: errorCode.ERR_UPDATE_ANNOUNCEMENT_FAILED,
          message: "Error updating announcement",
          details: error.message
        }
      };
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id) {
    try {
      const announcement = await this.announcementRepository.findById(id);
      
      if (!announcement) {
        return {
          success: false,
          error: {
            code: errorCode.ERR_ANNOUNCEMENT_NOT_FOUND,
            message: "Announcement not found"
          }
        };
      }

      await this.announcementRepository.delete(id);

      return {
        success: true,
        message: "Announcement deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return {
        success: false,
        error: {
          code: errorCode.ERR_DELETE_ANNOUNCEMENT_FAILED,
          message: "Error deleting announcement",
          details: error.message
        }
      };
    }
  }

  /**
   * Get active announcements for user based on role
   */
  async getActiveAnnouncementsForUser(userRole) {
    try {
      const announcements = await this.announcementRepository.getActiveForUser(userRole);

      return {
        success: true,
        data: announcements,
        message: "Active announcements retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting active announcements:", error);
      return {
        success: false,
        error: {
          code: errorCode.ERR_RETRIEVE_ANNOUNCEMENTS_FAILED,
          message: "Error retrieving announcements",
          details: error.message
        }
      };
    }
  }
}

module.exports = AnnouncementService;
