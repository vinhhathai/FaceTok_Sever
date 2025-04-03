"use strict";

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require("../../common/enum/error");
const path = require("path");
const fs = require("fs");

/**
 * @swagger
 * /user/update-avatar-url:
 *   put:
 *     summary: Update user's avatar URL
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarUrl
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 description: The Cloudinary URL of the avatar image
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.updateAvatarUrl = async (req, res) => {
  console.log('Update Avatar URL controller called');
  const { user_id } = req.user;
  const { avatarUrl } = req.body;
  
  console.log('User ID:', user_id);
  console.log('Avatar URL:', avatarUrl);

  // Check user_id
  if (!user_id) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-avatar-url`,
      code: errorCode.VALIDATION_FAILED,
      error: {
        name: errorMessage.ID_NOT_FOUND,
      },
    });
  }

  // Check avatarUrl
  if (!avatarUrl) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-avatar-url`,
      code: errorCode.VALIDATION_FAILED,
      error: {
        name: "Avatar URL is required",
      },
    });
  }

  try {
    // Find user by id
    console.log('Finding user with ID:', user_id);
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-avatar-url`,
        code: errorCode.DATA_NOT_FOUND,
        error: {
          name: errorMessage.USER_NOT_FOUND,
        },
      });
    }
    
    console.log('User found:', user.email);

    // Update user's profilePicture - Sử dụng updateOne để bỏ qua validation
    console.log('Updating user profile with new avatar URL');
    await UserModel.updateOne(
      { _id: user_id },
      { profilePicture: avatarUrl },
      { runValidators: false } // Tắt validation để tránh lỗi gender
    );
    console.log('User profile updated successfully');

    return res.status(200).json({
      message: "Avatar updated successfully",
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Error in updateAvatarUrl controller:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-avatar-url`,
      code: errorCode.ERR_UPDATE_AVATAR_FAILED,
      error: {
        name: error.message,
      },
    });
  }
};
