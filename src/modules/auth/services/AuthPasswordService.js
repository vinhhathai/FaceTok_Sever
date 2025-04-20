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
      // Kiểm tra đầu vào
      if (!email || !otp) {
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT,
          "Email và mã OTP là bắt buộc"
        );
      }

      // Chuẩn hóa email và OTP
      email = String(email).toLowerCase().trim();
      otp = String(otp).trim();

      // Tìm người dùng theo email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND,
          "Không tìm thấy tài khoản với email này"
        );
      }

      // Kiểm tra OTP hợp lệ
      const storedOtp = user.verification?.otp || "";
      
      if (!storedOtp || storedOtp !== otp) {
        return AuthPasswordDto.error(
          errorCode.VERIFY_OTP_FAILED,
          "Mã OTP không chính xác"
        );
      }

      // Kiểm tra OTP hết hạn
      const now = new Date();
      const otpExpiry = user.verification?.otpExpiry;
      
      if (!otpExpiry || now > otpExpiry) {
        return AuthPasswordDto.error(
          errorCode.TOKEN_EXPIRED,
          "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
        );
      }

      return AuthPasswordDto.success(
        { verified: true, email: user.email },
        "Xác thực OTP thành công"
      );
    } catch (error) {
      return AuthPasswordDto.error(
        errorCode.VERIFY_OTP_FAILED,
        "Xác thực OTP thất bại",
        error.message
      );
    }
  }

  async resetPassword(email, newPassword) {
    try {
      // Kiểm tra đầu vào
      if (!email || !newPassword) {
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT,
          "Email và mật khẩu mới là bắt buộc"
        );
      }

      // Chuẩn hóa email
      email = email.toLowerCase().trim();

      // Tìm người dùng
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND,
          "Không tìm thấy tài khoản với email này"
        );
      }

      // Hash mật khẩu và cập nhật
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu và xóa OTP
      await Promise.all([
        this.userRepository.updateUserPassword(user._id, hashedPassword),
        this.userRepository.updateUserVerification(user._id, {
          otp: null,
          otpExpiry: null,
        }),
      ]);

      return AuthPasswordDto.success(
        { updated: true },
        "Đặt lại mật khẩu thành công"
      );
    } catch (error) {
      return AuthPasswordDto.error(
        errorCode.RESET_PASSWORD_FAILED,
        "Đặt lại mật khẩu thất bại",
        error.message
      );
    }
  }

  async requestPasswordReset(email) {
    try {
      // Kiểm tra đầu vào
      if (!email) {
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT,
          "Email là bắt buộc"
        );
      }

      // Chuẩn hóa email
      email = email.toLowerCase().trim();
      
      // Tìm người dùng
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND,
          "Không tìm thấy tài khoản với email này"
        );
      }

      // Tạo OTP (6 chữ số)
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP có hiệu lực 10 phút

      // Lưu OTP và gửi email
      await this.userRepository.updateUserVerification(user._id, {
        otp,
        otpExpiry,
      });

      await EmailService.sendPasswordResetEmail(email, otp);

      return AuthPasswordDto.success(
        { emailSent: true, otpExpires: otpExpiry },
        "Đã gửi mã OTP đến email của bạn"
      );
    } catch (error) {
      return AuthPasswordDto.error(
        errorCode.REQUEST_PASSWORD_RESET_FAILED,
        "Không thể gửi email đặt lại mật khẩu",
        error.message
      );
    }
  }
}

module.exports = AuthPasswordService;
