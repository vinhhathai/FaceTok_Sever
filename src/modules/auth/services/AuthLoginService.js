"use strict";
//----------------------------------------------------------------
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");
require("dotenv").config();

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

class AuthLoginService {
  constructor() {
    this.userRepository = new UserRepository();
    this.jwtConfig = {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      refreshSecret: process.env.REFRESH_TOKEN_SECRET_KEY,
      accessTokenExpiry: "7d",
      refreshTokenExpiry: "30d",
    };
  }

  async login(email, password) {
    try {
      // Chuẩn hóa email (chuyển về chữ thường và loại bỏ khoảng trắng)
      email = email.toLowerCase().trim();

      // Tìm người dùng theo email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return createErrorResponse(
          401,
          "AUTH_INVALID_CREDENTIALS",
          "Email or password is incorrect"
        );
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return createErrorResponse(
          401,
          "AUTH_INVALID_CREDENTIALS",
          "Email or password is incorrect"
        );
      }

      // Kiểm tra trạng thái tài khoản
      if (!user.isActive) {
        return createErrorResponse(
          403,
          "AUTH_ACCOUNT_IS_BANNED",
          "Your account has been banned"
        );
      }

      // Tạo token
      const accessToken = jwt.sign(
        {
          _id: user._id,
          profilePicture: user.profilePicture,
          fullName: user.fullName,
          thumbnail: user.thumbnail,
          bio: user.bio,
        },
        this.jwtConfig.secret,
        { expiresIn: this.jwtConfig.accessTokenExpiry }
      );

      const refreshToken = jwt.sign(
        { _id: user._id },
        this.jwtConfig.refreshSecret,
        { expiresIn: this.jwtConfig.refreshTokenExpiry }
      );

      return {
        success: true,
        statusCode: 200,
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error("Error in login:", error);
      return createErrorResponse(
        500,
        "AUTH_LOGIN_FAILED",
        "An error occurred during login",
        error.message
      );
    }
  }
}

module.exports = AuthLoginService;
