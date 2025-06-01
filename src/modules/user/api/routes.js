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
} = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");
const uploadImageMiddleware = require("../../../shared/middlewares/uploadImageMiddleware");

// Profile Routes
router.get("/profile/:id", checkLogin, ProfileController.getProfile);
router.put("/update-profile", checkLogin, ProfileController.updateProfile);
router.put("/update-fullname", checkLogin, FullnameController.updateFullName);

// Search Routes
router.get("/search", checkLogin, UserSearchController.searchUsers);

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
