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
} = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");
const uploadImageMiddleware = require("../../../shared/middlewares/uploadImageMiddleware");



// Profile Routes
router.get("/blocked-users", checkLogin, ProfileController.getBlockedUsers);
router.put("/unblock-user", checkLogin, ProfileController.unblockUser);
router.put("/block-user", checkLogin, ProfileController.blockUser);
router.get("/profile/:id", checkLogin, ProfileController.getProfile);
router.put("/update-profile", checkLogin, ProfileController.updateProfile);
router.put("/update-fullname", checkLogin, FullnameController.updateFullName);

// Search Routes
router.get("/search", checkLogin, UserSearchController.searchUsers);

// Media Gallery Routes
router.get("/media/:userId", checkLogin, MediaController.getUserMedia);

//-----------------------------------------------------------
// Upload cover photo
router.post(
  "/upload-thumbnail",
  checkLogin,
  uploadImageMiddleware.coverPhoto,
  ThumbnailController.updateThumbnail
);

// Upload avatar photo
router.post(
  "/upload-avatar",
  checkLogin,
  uploadImageMiddleware.profilePicture,
  AvatarController.updateAvatar
);

// Other User Routes

module.exports = router;
