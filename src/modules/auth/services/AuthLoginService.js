"use strict";
//----------------------------------------------------------------
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");
const { errorCode } = require("../../../shared/common/error");
const { AuthLoginDto } = require("../dtos");
require("dotenv").config();

/**
 * Service for handling login
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
      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return AuthLoginDto.error(
          errorCode.INVALID_CREDENTIALS,
          "Invalid email or password"
        );
      }

      // Check account status
      if (!user.isActive) {
        return AuthLoginDto.error(
          errorCode.ACCOUNT_IS_BANNED,
          "Account has been suspended"
        );
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return AuthLoginDto.error(
          errorCode.INVALID_CREDENTIALS,
          "Invalid email or password"
        );
      }

      // Create JWT token
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

      // Create refresh token with longer lifetime
      const refreshToken = jwt.sign(
        {
          userId: user._id,
        },
        this.jwtConfig.refreshSecret,
        {
          expiresIn: this.jwtConfig.refreshTokenExpiry,
        }
      );

      // Create response data
      const responseData = AuthLoginDto.toResponse(
        user,
        accessToken,
        refreshToken
      );

      return AuthLoginDto.success(responseData, "Login successful");
    } catch (error) {
      return AuthLoginDto.error(
        errorCode.LOGIN_FAILED,
        "Login failed",
        error.message
      );
    }
  }
}

module.exports = AuthLoginService;
