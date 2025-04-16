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
      console.log("========== DEBUG INFO ==========");
      console.log(`Service verifyOTP received: email=${email}, otp=${otp}`);
      
      // Kiểm tra đầu vào
      if (!email || !otp) {
        console.log("Missing email or OTP");
        return AuthPasswordDto.error(
          errorCode.INVALID_INPUT, 
          "Email và mã OTP là bắt buộc"
        );
      }

      // Chuẩn hóa email
      email = String(email).toLowerCase().trim();
      otp = String(otp).trim();
      
      console.log(`After normalization: email=${email}, otp=${otp}, otp length=${otp.length}`);

      // Tìm người dùng theo email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        console.log(`User with email ${email} not found`);
        return AuthPasswordDto.error(
          errorCode.USER_NOT_FOUND, 
          "Không tìm thấy tài khoản với email này"
        );
      }

      console.log("User found:", user._id.toString());
      console.log("User verification data:", JSON.stringify(user.verification || {}));
      
      // Kiểm tra OTP hợp lệ
      const storedOtp = user.verification?.otp || "";
      console.log(`Comparing: stored OTP="${storedOtp}" vs input OTP="${otp}"`);
      
      if (!storedOtp || storedOtp !== otp) {
        console.log("OTP mismatch");
        return AuthPasswordDto.error(
          errorCode.VERIFY_OTP_FAILED, 
          "Mã OTP không chính xác"
        );
      }

      // Kiểm tra OTP hết hạn
      const now = new Date();
      const otpExpiry = user.verification?.otpExpiry;
      console.log(`OTP expiry check: now=${now.toISOString()}, expiry=${otpExpiry ? otpExpiry.toISOString() : 'none'}`);
      
      if (!otpExpiry || now > otpExpiry) {
        console.log("OTP expired");
        return AuthPasswordDto.error(
          errorCode.TOKEN_EXPIRED, 
          "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
        );
      }

      console.log("OTP verification successful");
      return AuthPasswordDto.success(
        { verified: true, email: user.email },
        "Xác thực OTP thành công"
      );
    } catch (error) {
      console.error('Verify OTP error:', error);
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
        this.userRepository.updateUserVerification(user._id, { otp: null, otpExpiry: null })
      ]);

      return AuthPasswordDto.success(
        { updated: true },
        "Đặt lại mật khẩu thành công"
      );
    } catch (error) {
      console.error('Reset password error:', error);
      return AuthPasswordDto.error(
        errorCode.PASSWORD_RESET_FAILED, 
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
      await Promise.all([
        this.userRepository.updateUserVerification(user._id, { otp, otpExpiry }),
        EmailService.sendPasswordResetEmail(email, otp)
      ]);

      return AuthPasswordDto.success(
        { emailSent: true, otpExpires: otpExpiry },
        "Đã gửi mã OTP đến email của bạn"
      );
    } catch (error) {
      console.error('Request password reset error:', error);
      return AuthPasswordDto.error(
        errorCode.PASSWORD_RESET_FAILED, 
        "Không thể gửi email đặt lại mật khẩu", 
        error.message
      );
    }
  }
}

module.exports = AuthPasswordService;
