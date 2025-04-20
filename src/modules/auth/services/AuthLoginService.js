"use strict";
//----------------------------------------------------------------
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");
const { errorCode } = require("../../../shared/common/error");
const { AuthLoginDto } = require("../dtos");
require("dotenv").config();

/**
 * Service xử lý đăng nhập
 */
class AuthLoginService {
  constructor() {
    this.userRepository = new UserRepository();
    this.jwtConfig = {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY || "access-token-secret",
      refreshSecret:
        process.env.REFRESH_TOKEN_SECRET_KEY || "refresh-token-secret",
      accessTokenExpiry: "7d",
      refreshTokenExpiry: "30d",
    };
  }


  async login(email, password) {
    try {
      // Tìm kiếm người dùng theo email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return AuthLoginDto.error(
          errorCode.INVALID_CREDENTIALS,
          "Email hoặc mật khẩu không đúng"
        );
      }

      // Kiểm tra trạng thái tài khoản
      if (!user.isActive) {
        return AuthLoginDto.error(
          errorCode.ACCOUNT_IS_BANNED,
          "Tài khoản đã bị tạm khóa"
        );
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return AuthLoginDto.error(
          errorCode.INVALID_CREDENTIALS,
          "Email hoặc mật khẩu không đúng"
        );
      }

      // Tạo JWT token
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        this.jwtConfig.secret,
        {
          expiresIn: this.jwtConfig.accessTokenExpiry,
        }
      );

      // Tạo refresh token với thời gian sống dài hơn
      const refreshToken = jwt.sign(
        {
          userId: user._id,
        },
        this.jwtConfig.refreshSecret,
        {
          expiresIn: this.jwtConfig.refreshTokenExpiry,
        }
      );

      // Tạo response data
      const responseData = AuthLoginDto.toResponse(
        user,
        accessToken,
        refreshToken
      );

      return AuthLoginDto.success(responseData, "Đăng nhập thành công");
    } catch (error) {
      return AuthLoginDto.error(
        errorCode.LOGIN_FAILED,
        "Đăng nhập thất bại",
        error.message
      );
    }
  }
}

module.exports = AuthLoginService;
