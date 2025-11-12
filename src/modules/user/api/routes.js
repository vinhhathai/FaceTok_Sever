"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const {
  UserController,
  ProfileController,
  AvatarController,
  ThumbnailController,
  FullnameController,
  UserSearchController,
  MediaController,
  AdminController,
} = require("../controllers");
const AnnouncementController = require("../controllers/AnnouncementController");
const announcementController = new AnnouncementController();
const ReportController = require("../controllers/ReportController");
const reportController = new ReportController();
const checkLogin = require("../../../shared/middlewares/checkLogin");
const checkAdmin = require("../../../shared/middlewares/checkAdmin");
const uploadImageMiddleware = require("../../../shared/middlewares/uploadImageMiddleware");
const { 
  uploadLimiter, 
  uploadAvatarLimiter, 
  uploadThumbnailLimiter, 
  createReportLimiter 
} = require("../../../shared/middlewares/rateLimiter");

// Admin Routes (must be before other routes to avoid conflicts)
router.get("/admin/verify", checkAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      userId: req.user.id,
      role: req.user.role,
      isAdmin: true
    },
    message: "Admin verified successfully"
  });
});
router.get("/admin/users", checkAdmin, AdminController.getAllUsers);
router.get("/admin/statistics", checkAdmin, AdminController.getUserStatistics);
router.post("/admin/ban/:userId", checkAdmin, AdminController.banUser);
router.post("/admin/unban/:userId", checkAdmin, AdminController.unbanUser);
router.delete("/admin/delete/:userId", checkAdmin, AdminController.deleteUser);
router.post("/admin/send-email", checkAdmin, AdminController.sendEmailToUser);
router.patch("/admin/update-role/:userId", checkAdmin, AdminController.updateUserRole);

// Announcement Admin Routes
router.post("/admin/announcements", checkAdmin, uploadImageMiddleware.single('image'), announcementController.createAnnouncement);
router.get("/admin/announcements", checkAdmin, announcementController.getAllAnnouncements);
router.get("/admin/announcements/:id", checkAdmin, announcementController.getAnnouncementById);
router.put("/admin/announcements/:id", checkAdmin, uploadImageMiddleware.single('image'), announcementController.updateAnnouncement);
router.delete("/admin/announcements/:id", checkAdmin, announcementController.deleteAnnouncement);

// Announcement User Routes
router.get("/announcements/active", checkLogin, announcementController.getActiveAnnouncements);

// Report Admin Routes
router.get("/admin/reports/statistics", checkAdmin, reportController.getReportStatistics);
router.get("/admin/reports", checkAdmin, reportController.getAllReports);
router.get("/admin/reports/:id", checkAdmin, reportController.getReportById);
router.patch("/admin/reports/:id/status", checkAdmin, reportController.updateReportStatus);
router.delete("/admin/reports/:id", checkAdmin, reportController.deleteReport);

// Report User Routes
router.post("/reports", checkLogin, createReportLimiter, uploadImageMiddleware.single('image'), reportController.createReport);
router.get("/reports", checkLogin, reportController.getUserReports);

// Profile Routes
router.get("/blocked-users", checkLogin, ProfileController.getBlockedUsers);
router.put("/unblock-user", checkLogin, ProfileController.unblockUser);
router.put("/block-user", checkLogin, ProfileController.blockUser);
router.get("/profile/:id", checkLogin, ProfileController.getProfile);
router.put("/update-profile", checkLogin, ProfileController.updateProfile);
router.put("/update-privacy", checkLogin, ProfileController.updatePrivacySetting);
router.put("/update-fullname", checkLogin, FullnameController.updateFullName);

// Search Routes
router.get("/search", checkLogin, UserSearchController.searchUsers);

// Media Gallery Routes
router.get("/media/:userId", checkLogin, MediaController.getUserMedia);

//-----------------------------------------------------------
// Upload thumbnail photo
router.post(
  "/upload-thumbnail",
  checkLogin,
  uploadThumbnailLimiter,
  uploadImageMiddleware.coverPhoto,
  ThumbnailController.updateThumbnail
);

// Upload avatar photo
router.post(
  "/upload-avatar",
  checkLogin,
  uploadAvatarLimiter,
  uploadImageMiddleware.profilePicture,
  AvatarController.updateAvatar
);

// Other User Routes

module.exports = router;
