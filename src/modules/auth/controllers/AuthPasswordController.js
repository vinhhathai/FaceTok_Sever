"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const AuthPasswordService = require("../services/AuthPasswordService");
const jwt = require("jsonwebtoken");
const { AuthPasswordDto } = require("../dtos");
const {
  emailValidation,
  otpVerificationValidation,
  passwordResetWithTokenValidation,
} = require("../validations/authValidation");

class AuthPasswordController {
  constructor() {
    this.authPasswordService = new AuthPasswordService();
  }

  requestPasswordReset = async (req, res) => {
    try {
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = emailValidation.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: error.details[0].message,
          },
          timestamp: new Date().toISOString(),
        });
      }

      const resetRequestData = AuthPasswordDto.toResetRequestData(value);
      const result = await this.authPasswordService.requestPasswordReset(
        resetRequestData.email
      );

      if (result.success) {
        return res.status(200).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Request password reset error:", error);
      return res.status(500).json({
        ...AuthPasswordDto.error(
          errorCode.INTERNAL_SERVER_ERROR,
          errorMessage.INTERNAL_SERVER_ERROR,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  verifyOTP = async (req, res) => {
    try {
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = otpVerificationValidation.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: error.details[0].message,
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Chuẩn hóa dữ liệu đầu vào
      const verificationData = AuthPasswordDto.toOtpVerificationData(value);
      console.log(verificationData);

      // Gọi service để xác thực OTP
      const result = await this.authPasswordService.verifyOTP(
        verificationData.email,
        verificationData.otp
      );

      // Nếu xác thực OTP thành công, tạo reset token
      if (result.success) {
        const resetPasswordToken = jwt.sign(
          { email: verificationData.email },
          process.env.SECRET_KEY || "secret-fallback",
          { expiresIn: "15m" }
        );

        return res.status(200).json({
          success: true,
          path: req.originalUrl,
          message: "Xác thực OTP thành công",
          data: {
            resetToken: resetPasswordToken,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({
        ...AuthPasswordDto.error(
          errorCode.VERIFY_OTP_FAILED,
          errorMessage.VERIFY_OTP_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = passwordResetWithTokenValidation.validate(
        req.body
      );

      if (error || !token) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: error
              ? error.details[0].message
              : "Token xác thực là bắt buộc",
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Xác thực token
      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.SECRET_KEY || "secret-fallback"
        );
      } catch (err) {
        return res.status(401).json({
          ...AuthPasswordDto.error(
            errorCode.TOKEN_EXPIRED,
            errorMessage.TOKEN_EXPIRED,
            err.message
          ),
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      const passwordResetData = AuthPasswordDto.toPasswordResetData({
        newPassword: value.newPassword,
        token,
      });

      const result = await this.authPasswordService.resetPassword(
        decoded.email,
        passwordResetData.newPassword
      );

      if (result.success) {
        return res.status(200).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        ...AuthPasswordDto.error(
          errorCode.PASSWORD_RESET_FAILED,
          errorMessage.PASSWORD_RESET_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = AuthPasswordController;
