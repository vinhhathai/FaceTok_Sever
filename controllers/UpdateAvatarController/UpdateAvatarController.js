"use strict";

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require("../../common/enum/error");

//----------------------------------------------------------------
exports.updateAvatar = async (req, res, next) => {
  const { user_id } = req.user;
  const file = req.file;

  // Check user_id
  if (!user_id) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-avatar/${user_id}`,
      code: errorCode.VALIDATION_FAILED,
      error: {
        name: errorMessage.ID_NOT_FOUND,
      },
    });
  }

  try {
    // Find user by id
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-avatar/${user_id}`,
        code: errorCode.DATA_NOT_FOUND,
        error: {
          name: errorMessage.USER_NOT_FOUND,
        },
      });
    }

    // Check if file exists
    if (!file) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: `/user/update-avatar/${user_id}`,
        code: errorCode.VALIDATION_FAILED,
        error: {
          name: "Avatar file is required",
        },
      });
    }

    // Generate new file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/upload/${
      file.filename
    }`;

    // Delete old avatar file if exists
    if (user.profilePicture) {
      const oldFilePath = path.join(
        __dirname,
        "../../public",
        user.profilePicture.split("/upload/")[1]
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error("Failed to delete old avatar:", err.message);
      });
    }

    // Update user's profilePicture
    user.profilePicture = fileUrl;
    await user.save();

    return res.status(200).json({
      message: "Avatar updated successfully",
      avatarUrl: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      path: `/user/update-avatar/${user_id}`,
      code: errorCode.ERR_UPDATE_AVATAR_FAILED,
      error: {
        name: error.message,
      },
    });
  }
};
