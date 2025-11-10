"use strict";
//----------------------------------------------------------------
const { AuthRegisterService } = require("../services");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AuthRegisterDto } = require("../dtos");
const { signUpValidation } = require("../validations/authValidation");

class AuthRegisterController {
  constructor() {
    this.authRegisterService = new AuthRegisterService();
  }

  signUp = async (req, res) => {
    try {
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = signUpValidation.validate(req.body);

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

      const result = await this.authRegisterService.register(value);

      if (result.success) {
        return res.status(201).json({
          ...result,
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Sign up controller error:", error);
      return res.status(500).json({
        ...AuthRegisterDto.error(
          errorCode.CREATE_ACCOUNT_FAILED,
          errorMessage.CREATE_ACCOUNT_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Verify email with OTP
   */
  verifyEmail = async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: "Email and OTP are required",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await this.authRegisterService.verifyEmail(email, otp);

      if (result.success) {
        return res.status(200).json({
          ...result,
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Verify email controller error:", error);
      return res.status(500).json({
        ...AuthRegisterDto.error(
          errorCode.VERIFY_EMAIL_FAILED,
          "Email verification failed",
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Resend verification OTP
   */
  resendVerificationOTP = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: "Email is required",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await this.authRegisterService.resendVerificationOTP(email);

      if (result.success) {
        return res.status(200).json({
          ...result,
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Resend verification OTP controller error:", error);
      return res.status(500).json({
        ...AuthRegisterDto.error(
          errorCode.RESEND_OTP_FAILED,
          "Failed to resend verification code",
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = AuthRegisterController;
