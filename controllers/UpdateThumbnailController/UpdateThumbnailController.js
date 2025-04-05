"use strict";

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require("../../common/enum/error");
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

/**
 * @swagger
 * /user/update-thumbnail-url:
 *   put:
 *     summary: Update user's thumbnail URL
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
 *               - thumbnailUrl
 *             properties:
 *               thumbnailUrl:
 *                 type: string
 *                 description: The Cloudinary URL of the thumbnail image
 *     responses:
 *       200:
 *         description: Thumbnail updated successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.updateThumbnailUrl = async (req, res) => {
  console.log('===========================================');
  console.log('Update Thumbnail URL controller called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const { user_id } = req.user;
  const { thumbnailUrl } = req.body;
  
  console.log('User ID:', user_id);
  console.log('Thumbnail URL:', thumbnailUrl);

  // Check user_id
  if (!user_id) {
    console.log('Error: User ID not found');
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-thumbnail-url`,
      code: errorCode.VALIDATION_FAILED,
      error: {
        name: errorMessage.ID_NOT_FOUND,
      },
    });
  }

  // Check thumbnailUrl
  if (!thumbnailUrl) {
    console.log('Error: Thumbnail URL not provided');
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-thumbnail-url`,
      code: errorCode.VALIDATION_FAILED,
      error: {
        name: "Thumbnail URL is required",
      },
    });
  }

  try {
    // Kiểm tra xem user_id có phải ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      console.log('Error: Invalid user ID format');
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-thumbnail-url`,
        code: errorCode.VALIDATION_FAILED,
        error: {
          name: "Invalid user ID format",
        },
      });
    }
    
    // Find user by id
    console.log('Finding user with ID:', user_id);
    const user = await UserModel.findById(user_id);
    if (!user) {
      console.log('Error: User not found in database');
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-thumbnail-url`,
        code: errorCode.DATA_NOT_FOUND,
        error: {
          name: errorMessage.USER_NOT_FOUND,
        },
      });
    }
    
    console.log('User found:', user.email);
    console.log('Current thumbnail:', user.thumbnail);

    // Update user's thumbnail URL - Sử dụng findOneAndUpdate thay vì updateOne
    console.log('Updating user profile with new thumbnail URL');
    
    try {
      const updateResult = await UserModel.findOneAndUpdate(
        { _id: user_id },
        { $set: { thumbnail: thumbnailUrl } },
        { new: true, runValidators: false }
      );
      
      console.log('Update result:', updateResult);
      
      if (!updateResult) {
        console.log('Warning: Update returned null - document might not exist');
      } else {
        console.log('User thumbnail updated successfully');
        console.log('New thumbnail:', updateResult.thumbnail);
      }
    } catch (updateError) {
      console.error('Error during update operation:', updateError);
      throw updateError;
    }
    
    // Kiểm tra lại sau khi cập nhật
    try {
      const updatedUser = await UserModel.findById(user_id);
      console.log('Fetched user after update. Updated thumbnail:', updatedUser.thumbnail);
      
      if (updatedUser.thumbnail !== thumbnailUrl) {
        console.log('Warning: Thumbnail URL mismatch after update!');
        console.log('Expected:', thumbnailUrl);
        console.log('Actual:', updatedUser.thumbnail);
      }
    } catch (fetchError) {
      console.error('Error fetching updated user:', fetchError);
    }

    return res.status(200).json({
      message: "Thumbnail updated successfully",
      thumbnailUrl: thumbnailUrl
    });
  } catch (error) {
    console.error('Error in updateThumbnailUrl controller:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-thumbnail-url`,
      code: errorCode.ERR_UPDATE_THUMBNAIL_FAILED,
      error: {
        name: error.message,
        stack: error.stack
      },
    });
  }
};

//----------------------------------------------------------------
exports.updateThumbnail = async (req, res, next) => {
  const { user_id } = req.user;
  const file = req.file;

  // Check user_id
  if (!user_id) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-thumbnail/${user_id}`,
      code: errorCode.VALIDATION_FAILED,
      error: {
        name: errorMessage.ID_NOT_FOUND,
      },
    });
  }

  try {
    // Find user by user_id
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-thumbnail/${user_id}`,
        code: errorCode.DATA_NOT_FOUND,
        error: {
          name: errorMessage.USER_NOT_FOUND,
        },
      });
    }

    // Check if file is not exist
    if (!file) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-thumbnail/${user_id}`,
        code: errorCode.VALIDATION_FAILED,
        error: {
          name: "Thumbnail file is required",
        },
      });
    }

    // Create URL for new file
    const fileUrl = `${req.protocol}://${req.get("host")}/upload/${file.filename}`;
    
    // Delete old thumbnail file if it exists
    if (user.thumbnail) {
      try {
        // Extract filename from the thumbnail URL
        const oldFilename = user.thumbnail.split('/').pop();
        console.log(oldFilename)
        const oldFilePath = path.join(__dirname, '../../public/upload', oldFilename);
        console.log(oldFilePath)

        
        // Check if file exists before attempting to delete
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error("Error deleting old thumbnail:", error);
        // Continue with the update even if delete fails
      }
    }

    // Update user's thumbnail field
    user.thumbnail = fileUrl;
    await user.save();

    return res.status(200).json({
      message: "Thumbnail updated successfully",
      thumbnailUrl: fileUrl
    });
  } catch (error) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-thumbnail/${user_id}`,
      code: errorCode.ERR_UPDATE_THUMBNAIL_FAILED,
      error: {
        name: error.message,
      },
    });
  }
};