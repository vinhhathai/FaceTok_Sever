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

      const result = await this.authPasswordService.requestPasswordReset(
        value.email
      );

      if (result.success) {
        return res.status(200).json({
          ...result
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
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

      // Chuyển OTP thành string nếu là số
      const otpString = String(value.otp).trim();
      const email = String(value.email).toLowerCase().trim();

      const result = await this.authPasswordService.verifyOTP(
        email,
        otpString
      );

      if (result.success) {
        try {
          const secretKey = process.env.SECRET_KEY || "secret-fallback";
          
          const resetPasswordToken = jwt.sign(
            { email: email },
            secretKey,
            { expiresIn: "15m" }
          );
          
          // Sử dụng helper từ DTO
          const tokenData = AuthPasswordDto.toTokenResponse(email, resetPasswordToken);
          
          const response = {
            success: true,
            message: "Xác thực OTP thành công",
            data: tokenData
          };
          
          return res.status(200).json(response);
        } catch (tokenError) {
          return res.status(500).json({
            success: false,
            message: "Lỗi tạo token",
            error: {
              code: errorCode.INTERNAL_SERVER_ERROR,
              message: tokenError.message,
            },
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
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

      const result = await this.authPasswordService.resetPassword(
        decoded.email,
        value.newPassword
      );

      if (result.success) {
        return res.status(200).json({
          ...result
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      return res.status(500).json({
        ...AuthPasswordDto.error(
          errorCode.RESET_PASSWORD_FAILED,
          errorMessage.RESET_PASSWORD_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = AuthPasswordController;
