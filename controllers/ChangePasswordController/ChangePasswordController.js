"use strict";
//----------------------------------------------------------------
const bcrypt = require("bcrypt");
const UserModel = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const changePasswordValidation = require("../../validation/changePasswordValidation");
const { errorMessage, errorCode } = require("../../common/enum/error");
const redis = require("redis");
const sendResetPasswordEmail = require("../../utils/sendResetPasswordEmail");

// **Đổi mật khẩu**
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, resetPasswordToken } = req.body;

    // **1. Validate mật khẩu**
    const { error } = await changePasswordValidation.validate({
      newPassword,
      confirmNewPassword,
    });
    if (error) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: "/auth/change-password",
        code: errorCode.VALIDATION_FAILED,
        error: {
          name: error.message,
        },
      });
    }

    // **2. Xác thực token**
    let emailFromToken;
    try {
      const decoded = jwt.verify(resetPasswordToken, process.env.SECRET_KEY);
      emailFromToken = decoded.email;
    } catch (tokenError) {
      return res.status(403).json({
        timestamp: new Date().toISOString(),
        path: "/auth/change-password",
        code: errorCode.UNAUTHORIZED,
        error: {
          name: errorMessage.EXPIRED_TOKEN,
        },
      });
    }

    // Tìm user theo email
    const user = await UserModel.findOne({ email: emailFromToken });
    if (!user) {
      return res.status(404).json({
        code: errorCode.EMAIL_NOT_FOUND,
        error: { name: errorMessage.EMAIL_NOT_FOUND },
      });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu trong DB
    await UserModel.updateOne(
      { email: emailFromToken },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      path: "/auth/change-password",
      code: errorCode.ERR_CHANGE_PASSWORD_FAILED,
      error: {
        name: errorMessage.ERR_CHANGE_PASSWORD_FAILED,
      },
    });
  }
};
