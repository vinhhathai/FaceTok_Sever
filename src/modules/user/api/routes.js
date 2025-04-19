"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { UserController, ProfileController, AvatarController, ThumbnailController, FullnameController } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");

// Profile Routes
router.get("/profile/:id", checkLogin, ProfileController.getProfile);
router.put("/update-profile", checkLogin, ProfileController.updateProfile);

// Avatar Routes
router.put("/update-avatar-url", checkLogin, AvatarController.updateAvatarUrl);

// Thumbnail Routes
router.put("/update-thumbnail-url", checkLogin, ThumbnailController.updateThumbnailUrl);

// Fullname Routes
router.put("/update-fullname", checkLogin, FullnameController.updateFullName);

// Other User Routes

module.exports = router; 