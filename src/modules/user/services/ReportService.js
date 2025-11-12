"use strict";
//----------------------------------------------------------------
const ReportRepository = require("../repositories/ReportRepository");
const { errorCode } = require("../../../shared/common/error");

/**
 * Service xử lý các chức năng report
 */
class ReportService {
  constructor() {
    this.reportRepository = new ReportRepository();
  }

  /**
   * Create a new report (User)
   */
  async createReport({ reportType, title, description, reportedBy, image, imagePublicId, relatedPostId, relatedUserId }) {
    try {
      const reportData = {
        reportType: reportType || 'other',
        title: title.trim(),
        description: description.trim(),
        reportedBy,
        image: image || "",
        imagePublicId: imagePublicId || "",
        relatedPostId: relatedPostId || null,
        relatedUserId: relatedUserId || null,
        status: 'pending'
      };

      const report = await this.reportRepository.create(reportData);

      return {
        success: true,
        data: report,
        message: "Report submitted successfully"
      };
    } catch (error) {
      console.error("Error creating report:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error creating report",
          details: error.message
        }
      };
    }
  }

  /**
   * Get all reports with pagination (Admin only)
   */
  async getAllReports({ page = 1, limit = 10, status, reportType }) {
    try {
      const filter = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (reportType) {
        filter.reportType = reportType;
      }

      const skip = (page - 1) * limit;
      const total = await this.reportRepository.countDocuments(filter);

      const reports = await this.reportRepository.findAll(
        filter,
        {},
        {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      );

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      };

      return {
        success: true,
        data: {
          reports,
          pagination,
          total
        },
        message: "Reports retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting all reports:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving reports",
          details: error.message
        }
      };
    }
  }

  /**
   * Get reports by user (User can see their own reports)
   */
  async getUserReports({ userId, page = 1, limit = 10, status }) {
    try {
      const filter = { reportedBy: userId };
      
      if (status) {
        filter.status = status;
      }

      const skip = (page - 1) * limit;
      const total = await this.reportRepository.countDocuments(filter);

      const reports = await this.reportRepository.findAll(
        filter,
        {},
        {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      );

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      };

      return {
        success: true,
        data: {
          reports,
          pagination,
          total
        },
        message: "User reports retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting user reports:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving user reports",
          details: error.message
        }
      };
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(id) {
    try {
      const report = await this.reportRepository.findById(id);
      
      if (!report) {
        return {
          success: false,
          error: {
            code: errorCode.DATA_NOT_FOUND,
            message: "Report not found"
          }
        };
      }

      return {
        success: true,
        data: report,
        message: "Report retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting report by ID:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving report",
          details: error.message
        }
      };
    }
  }

  /**
   * Update report status (Admin only)
   */
  async updateReportStatus(id, { status, adminNote, resolvedBy }) {
    try {
      const report = await this.reportRepository.findById(id);
      
      if (!report) {
        return {
          success: false,
          error: {
            code: errorCode.DATA_NOT_FOUND,
            message: "Report not found"
          }
        };
      }

      const updateData = {
        status
      };

      if (adminNote) {
        updateData.adminNote = adminNote;
      }

      if (status === 'resolved' || status === 'rejected') {
        updateData.resolvedBy = resolvedBy;
        updateData.resolvedAt = new Date();
      }

      const updatedReport = await this.reportRepository.update(id, updateData);

      return {
        success: true,
        data: updatedReport,
        message: "Report status updated successfully"
      };
    } catch (error) {
      console.error("Error updating report status:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error updating report status",
          details: error.message
        }
      };
    }
  }

  /**
   * Delete report (Admin only)
   */
  async deleteReport(id) {
    try {
      const report = await this.reportRepository.findById(id);
      
      if (!report) {
        return {
          success: false,
          error: {
            code: errorCode.DATA_NOT_FOUND,
            message: "Report not found"
          }
        };
      }

      await this.reportRepository.delete(id);

      return {
        success: true,
        data: { id },
        message: "Report deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting report:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error deleting report",
          details: error.message
        }
      };
    }
  }

  /**
   * Get report statistics (Admin only)
   */
  async getReportStatistics() {
    try {
      const total = await this.reportRepository.countDocuments({});
      const pending = await this.reportRepository.countDocuments({ status: 'pending' });
      const reviewing = await this.reportRepository.countDocuments({ status: 'reviewing' });
      const resolved = await this.reportRepository.countDocuments({ status: 'resolved' });
      const rejected = await this.reportRepository.countDocuments({ status: 'rejected' });

      // Count by type
      const bugReports = await this.reportRepository.countDocuments({ reportType: 'bug' });
      const postReports = await this.reportRepository.countDocuments({ reportType: 'post' });
      const userReports = await this.reportRepository.countDocuments({ reportType: 'user' });
      const otherReports = await this.reportRepository.countDocuments({ reportType: 'other' });

      return {
        success: true,
        data: {
          total,
          byStatus: {
            pending,
            reviewing,
            resolved,
            rejected
          },
          byType: {
            bug: bugReports,
            post: postReports,
            user: userReports,
            other: otherReports
          }
        },
        message: "Report statistics retrieved successfully"
      };
    } catch (error) {
      console.error("Error getting report statistics:", error);
      return {
        success: false,
        error: {
          code: errorCode.INTERNAL_SERVER_ERROR,
          message: "Error retrieving report statistics",
          details: error.message
        }
      };
    }
  }
}

module.exports = ReportService;
