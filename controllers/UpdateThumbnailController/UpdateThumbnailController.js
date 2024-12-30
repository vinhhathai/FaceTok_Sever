"use strict";

const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require("../../common/enum/error");

//----------------------------------------------------------------
exports.updateThumbnail = async (req, res, next) => {
  const { user_id } = req.user;
  const file = req.file;

  // Kiểm tra user_id
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
    // Tìm người dùng theo user_id
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

    // Kiểm tra xem file có tồn tại không
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

    // Tạo URL cho file mới
    const fileUrl = `${req.protocol}://${req.get("host")}/upload/${file.filename}`;

    // Cập nhật trường thumbnail của người dùng
    user.thumbnail = fileUrl;
    await user.save();

    return res.status(200).json({
      message: "Thumbnail updated successfully",
      thumbnailUrl: fileUrl,
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
