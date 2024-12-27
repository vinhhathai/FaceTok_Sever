"use strict";
//----------------------------------------------------------------
const UserModel = require("../../models/UserModel");
const emailValidation = require("../../validation/emailValidation");
const jwt = require("jsonwebtoken");
const { errorMessage, errorCode } = require("../../common/enum/error");
require("dotenv").config();
const sendResetPasswordEmail = require("../../utils/sendResetPasswordEmail");
const { generateOTP } = require("../../utils/generateOTPCode");

// Send a reset password email
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Tìm user theo email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        code: errorCode.EMAIL_NOT_FOUND,
        error: {
          name: errorMessage.EMAIL_NOT_FOUND,
        },
      });
    }

    // Kiểm tra OTP và thời gian hết hạn
    if (user.otp !== otp) {
      return res.status(400).json({
        code: errorCode.INVALID_OTP,
        error: {
          name: "Invalid OTP",
        },
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        code: errorCode.OTP_EXPIRED,
        error: {
          name: "OTP expired",
        },
      });
    }

    // Nếu OTP hợp lệ, tạo token hoặc đặt cờ để cho phép đặt lại mật khẩu
    const resetPasswordToken = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "15m", // 15 phút
    });

    // Xóa OTP sau khi sử dụng
    await UserModel.updateOne(
      { email },
      { $unset: { otp: "", otpExpiry: "" } }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      resetPasswordToken,
    });
  } catch (error) {
    return res.status(500).json({
      code: errorCode.INTERNAL_SERVER_ERROR,
      error: {
        name: error.message,
      },
    });
  }
};
