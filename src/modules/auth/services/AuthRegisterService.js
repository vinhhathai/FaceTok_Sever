"use strict";
//----------------------------------------------------------------
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");
const { errorCode } = require("../../../shared/common/error");
const { AuthRegisterDto } = require("../dtos");
const EmailService = require("../../../shared/services/EmailService");

class AuthRegisterService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Generate 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(data) {
    try {
      // Check if email already exists
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        return AuthRegisterDto.error(
          errorCode.EMAIL_ALREADY_EXISTS,
          "Email is already in use. Please use a different email."
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // Generate OTP for email verification
      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create userData object from input data
      const userData = {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        isActive: false,  // Inactive until email verified
        isEmailVerified: false,
        emailVerificationOTP: otp,
        emailVerificationExpiry: otpExpiry
      };

      // Create new user with correct schema structure
      const newUser = await this.userRepository.create(userData);

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(
          data.email,
          otp,
          data.fullName
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail registration if email fails, user can resend
      }

      // Create response data from DTO
      const responseData = AuthRegisterDto.toResponse(newUser);

      return AuthRegisterDto.success(
        responseData,
        "Account registration successful. Please check your email to verify your account."
      );
    } catch (error) {
      return AuthRegisterDto.error(
        errorCode.REGISTER_FAILED,
        "Account registration failed",
        error.message
      );
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(email, otp) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return AuthRegisterDto.error(
          errorCode.USER_NOT_FOUND,
          "User not found"
        );
      }

      if (user.isEmailVerified) {
        return AuthRegisterDto.error(
          errorCode.INVALID_INPUT,
          "Email is already verified"
        );
      }

      if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
        return AuthRegisterDto.error(
          errorCode.INVALID_OTP,
          "Invalid verification code"
        );
      }

      if (new Date() > user.emailVerificationExpiry) {
        return AuthRegisterDto.error(
          errorCode.OTP_EXPIRED,
          "Verification code has expired. Please request a new one."
        );
      }

      // Mark email as verified
      await this.userRepository.update(user._id, {
        isEmailVerified: true,
        isActive: true,
        emailVerificationOTP: null,
        emailVerificationExpiry: null
      });

      return AuthRegisterDto.success(
        null,
        "Email verified successfully. You can now login."
      );
    } catch (error) {
      return AuthRegisterDto.error(
        errorCode.VERIFY_EMAIL_FAILED,
        "Email verification failed",
        error.message
      );
    }
  }

  /**
   * Resend verification OTP
   */
  async resendVerificationOTP(email) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return AuthRegisterDto.error(
          errorCode.USER_NOT_FOUND,
          "User not found"
        );
      }

      if (user.isEmailVerified) {
        return AuthRegisterDto.error(
          errorCode.INVALID_INPUT,
          "Email is already verified"
        );
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // Update user with new OTP
      await this.userRepository.update(user._id, {
        emailVerificationOTP: otp,
        emailVerificationExpiry: otpExpiry
      });

      // Send verification email
      await EmailService.sendVerificationEmail(
        email,
        otp,
        user.fullName
      );

      return AuthRegisterDto.success(
        null,
        "Verification code sent to your email"
      );
    } catch (error) {
      return AuthRegisterDto.error(
        errorCode.RESEND_OTP_FAILED,
        "Failed to resend verification code",
        error.message
      );
    }
  }
}

module.exports = AuthRegisterService;
