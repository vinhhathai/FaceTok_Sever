"use strict";
//----------------------------------------------------------------
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const UserRepository = require("../../user/repositories/UserRepository");
const EmailService = require("../../../shared/services/EmailService");
const { errorCode } = require("../../../shared/common/error");
const { AuthPasswordDto } = require("../dtos");

class AuthPasswordService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async verifyOTP(email, otp) {
    try {
      // Check input
      if (!email || !otp) {
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT,
          "Email and OTP are required"
        );
      }

      // Normalize email and OTP
      email = String(email).toLowerCase().trim();
      otp = String(otp).trim();

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND,
          "No account found with this email"
        );
      }

      // Validate OTP
      const storedOtp = user.verification?.otp || "";
      
      if (!storedOtp || storedOtp !== otp) {
        return AuthPasswordDto.error(
          errorCode.VERIFY_OTP_FAILED,
          "Incorrect OTP"
        );
      }

      // Check OTP expiration
      const now = new Date();
      const otpExpiry = user.verification?.otpExpiry;
      
      if (!otpExpiry || now > otpExpiry) {
        return AuthPasswordDto.error(
          errorCode.TOKEN_EXPIRED,
          "OTP has expired. Please request a new code"
        );
      }

      return AuthPasswordDto.success(
        { verified: true, email: user.email },
        "OTP verification successful"
      );
    } catch (error) {
      return AuthPasswordDto.error(
        errorCode.VERIFY_OTP_FAILED,
        "OTP verification failed",
        error.message
      );
    }
  }

  async resetPassword(email, newPassword) {
    try {
      // Check input
      if (!email || !newPassword) {
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT,
          "Email and new password are required"
        );
      }

      // Normalize email
      email = email.toLowerCase().trim();

      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND,
          "No account found with this email"
        );
      }

      // Hash password and update
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear OTP
      await Promise.all([
        this.userRepository.updateUserPassword(user._id, hashedPassword),
        this.userRepository.updateUserVerification(user._id, {
          otp: null,
          otpExpiry: null,
        }),
      ]);

      return AuthPasswordDto.success(
        { updated: true },
        "Password reset successful"
      );
    } catch (error) {
      return AuthPasswordDto.error(
        errorCode.RESET_PASSWORD_FAILED,
        "Password reset failed",
        error.message
      );
    }
  }

  async requestPasswordReset(email) {
    try {
      // Check input
      if (!email) {
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT,
          "Email is required"
        );
      }

      // Normalize email
      email = email.toLowerCase().trim();
      
      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND,
          "No account found with this email"
        );
      }

      // Generate OTP (6 digits)
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

      // Save OTP and send email
      await this.userRepository.updateUserVerification(user._id, {
        otp,
        otpExpiry,
      });

      await EmailService.sendPasswordResetEmail(email, otp);

      return AuthPasswordDto.success(
        { emailSent: true, otpExpires: otpExpiry },
        "OTP code has been sent to your email"
      );
    } catch (error) {
      return AuthPasswordDto.error(
        errorCode.REQUEST_PASSWORD_RESET_FAILED,
        "Unable to send password reset email",
        error.message
      );
    }
  }
}

module.exports = AuthPasswordService;
