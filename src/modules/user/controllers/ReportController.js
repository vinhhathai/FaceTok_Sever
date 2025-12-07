"use strict";
//----------------------------------------------------------------
const ReportService = require("../services/ReportService");
const { processAndUploadImage, deleteFromCloudinary } = require("../../../shared/utils/cloudinaryUpload");
const { errorCode } = require("../../../shared/common/error");

/**
 * Controller xử lý các request liên quan đến report
 */
class ReportController {
  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Create a new report (User)
   * POST /user/reports
   */
  createReport = async (req, res) => {
    try {
      const { reportType, title, description, relatedPostId, relatedUserId } = req.body;
      
      // Get userId from req.user (checkLogin middleware sets req.user.id, not _id)
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: errorCode.UNAUTHORIZED,
            message: "User not authenticated"
          }
        });
      }

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: {
            code: errorCode.INVALID_INPUT,
            message: "Title and description are required"
          }
        });
      }

      let imageUrl = "";
      let imagePublicId = "";

      // Handle image upload if provided
      if (req.file) {
        try {
          // Process and upload image to Cloudinary
          const uploadResult = await processAndUploadImage(
            req.file.buffer,
            'chaotok/reports',
            {
              maxWidth: 800,
              maxHeight: 600,
              quality: 85
            }
          );

          imageUrl = uploadResult.secure_url;
          imagePublicId = uploadResult.public_id;
        } catch (uploadError) {
          return res.status(500).json({
            success: false,
            error: {
              code: errorCode.INTERNAL_SERVER_ERROR,
              message: "Error uploading image",
              details: uploadError.message
            }
          });
        }
      }

      const result = await this.reportService.createReport({
        reportType,
        title,
        description,
        reportedBy: userId,
        image: imageUrl,
        imagePublicId,
        relatedPostId,
        relatedUserId
      });

      if (!result.success) {
        // Rollback image if report creation failed
        if (imagePublicId) {
          await deleteFromCloudinary(imagePublicId);
        }
        return res.status(500).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error creating report",
          details: error.message
        }
      });
    }
  };

  /**
   * Get all reports (Admin only)
   * GET /user/admin/reports
   */
  getAllReports = async (req, res) => {
    try {
      const { page, limit, status, reportType } = req.query;

      const result = await this.reportService.getAllReports({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        reportType
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving reports",
          details: error.message
        }
      });
    }
  };

  /**
   * Get user's own reports
   * GET /user/reports
   */
  getUserReports = async (req, res) => {
    try {
      const userId = req.user._id;
      const { page, limit, status } = req.query;

      const result = await this.reportService.getUserReports({
        userId,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving user reports",
          details: error.message
        }
      });
    }
  };

  /**
   * Get report by ID (Admin only)
   * GET /user/admin/reports/:id
   */
  getReportById = async (req, res) => {
    try {
      const { id } = req.params;

      const result = await this.reportService.getReportById(id);

      if (!result.success) {
        const statusCode = result.error.code === errorCode.DATA_NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving report",
          details: error.message
        }
      });
    }
  };

  /**
   * Update report status (Admin only)
   * PATCH /user/admin/reports/:id/status
   */
  updateReportStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      const adminId = req.user._id;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            code: errorCode.INVALID_INPUT,
            message: "Status is required"
          }
        });
      }

      const validStatuses = ['pending', 'reviewing', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: errorCode.INVALID_INPUT,
            message: "Invalid status value"
          }
        });
      }

      const result = await this.reportService.updateReportStatus(id, {
        status,
        adminNote,
        resolvedBy: adminId
      });

      if (!result.success) {
        const statusCode = result.error.code === errorCode.DATA_NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error updating report status",
          details: error.message
        }
      });
    }
  };

  /**
   * Delete report (Admin only)
   * DELETE /user/admin/reports/:id
   */
  deleteReport = async (req, res) => {
    try {
      const { id } = req.params;

      // Get report first to check for image
      const reportResult = await this.reportService.getReportById(id);
      
      if (!reportResult.success) {
        const statusCode = reportResult.error.code === errorCode.DATA_NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(reportResult);
      }

      // Delete image from Cloudinary if exists
      if (reportResult.data.imagePublicId) {
        try {
          await deleteFromCloudinary(reportResult.data.imagePublicId);
        } catch (imageError) {
          // Log but don't fail the deletion
        }
      }

      const result = await this.reportService.deleteReport(id);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error deleting report",
          details: error.message
        }
      });
    }
  };

  /**
   * Get report statistics (Admin only)
   * GET /user/admin/reports/statistics
   */
  getReportStatistics = async (req, res) => {
    try {
      const result = await this.reportService.getReportStatistics();

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving report statistics",
          details: error.message
        }
      });
    }
  };
}

module.exports = ReportController;
