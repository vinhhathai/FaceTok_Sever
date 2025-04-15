"use strict";
//----------------------------------------------------------------
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");

// Helper function to create standardized error responses
const createErrorResponse = (statusCode, code, message) => {
  return {
    success: false,
    statusCode,
    error: {
      code,
      message,
    },
  };
};

class AuthPasswordService {
  constructor(userRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async resetPassword(email, otp, newPassword) {
    try {
      // Chuẩn hóa email
      email = email.toLowerCase().trim();

      // Tìm người dùng theo email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        };
      }

      // Kiểm tra OTP
      if (user.verification.otp !== otp) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: "INVALID_OTP",
            message: "Invalid OTP",
          },
        };
      }

      // Kiểm tra thời hạn OTP
      if (new Date() > user.verification.otpExpiry) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: "OTP_EXPIRED",
            message: "OTP has expired",
          },
        };
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu và xóa OTP
      user.password = hashedPassword;
      user.verification.otp = null;
      user.verification.otpExpiry = null;
      await user.save();

      return {
        success: true,
        statusCode: 200,
        data: {
          message: "Password reset successfully",
        },
      };
    } catch (error) {
      console.error("Error in resetPassword:", error);
      return createErrorResponse(
        500,
        "INTERNAL_SERVER_ERROR",
        "An error occurred during password reset"
      );
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Tìm người dùng
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        };
      }

      // Kiểm tra mật khẩu hiện tại
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: "INVALID_PASSWORD",
            message: "Current password is incorrect",
          },
        };
      }

      // Kiểm tra mật khẩu mới có giống mật khẩu cũ không
      if (currentPassword === newPassword) {
        return {
          success: false,
          statusCode: 400,
          error: {
            code: "SAME_PASSWORD",
            message: "New password cannot be the same as current password",
          },
        };
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu
      user.password = hashedPassword;
      await user.save();

      return {
        success: true,
        statusCode: 200,
        data: {
          message: "Password changed successfully",
        },
      };
    } catch (error) {
      console.error("Error in changePassword:", error);
      return createErrorResponse(
        500,
        "INTERNAL_SERVER_ERROR",
        "An error occurred during password change"
      );
    }
  }

  async requestPasswordReset(email) {
    try {
      // Chuẩn hóa email (chuyển sang chữ thường)
      email = email.toLowerCase().trim();

      // Tìm người dùng theo email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          statusCode: 404,
          error: {
            code: "EMAIL_NOT_FOUND",
            message: "No user found with this email",
          },
        };
      }

      // Tạo OTP để đặt lại mật khẩu
      const otp = generateOTPCode();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP hết hạn sau 10 phút

      // Cập nhật OTP cho người dùng
      user.verification.otp = otp;
      user.verification.otpExpiry = otpExpiry;
      await user.save();

      // Gửi email với OTP
      await EmailService.sendPasswordResetEmail(email, otp);

      return {
        success: true,
        statusCode: 200,
        data: {
          message: "Password reset OTP sent to your email",
          userId: user._id,
        },
      };
    } catch (error) {
      console.error("Error in requestPasswordReset:", error);
      return createErrorResponse(
        500,
        "INTERNAL_SERVER_ERROR",
        "An error occurred during password reset request"
      );
    }
  }
}

module.exports = AuthPasswordService;
