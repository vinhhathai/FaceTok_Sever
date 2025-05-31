const express = require("express");
const router = express.Router();
const profileController = require("../controllers/ProfileController");
const uploadImageMiddleware = require("../../../shared/middlewares/uploadImageMiddleware");
const { checkLogin } = require("../../../shared/middlewares/checkLogin");

// Get user profile
// router.get("/:userId", profileController.getUserProfile);

// // Update user profile
// router.put("/update", authMiddleware, profileController.updateProfile);

// // Upload profile picture
// router.post(
//   "/upload-avatar",
//   checkLogin,
//   uploadImageMiddleware.profilePicture,
//   profileController.updateProfilePicture
// );

// // Upload cover photo
// router.post(
//   "/upload-thumbnail",
//   checkLogin,
//   uploadImageMiddleware.coverPhoto,
//   profileController.updateCoverPhoto
// );

module.exports = router;
