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
    
    // Validate JWT secrets are configured
    if (!process.env.ACCESS_TOKEN_SECRET_KEY || !process.env.REFRESH_TOKEN_SECRET_KEY) {
      throw new Error('FATAL: JWT secrets (ACCESS_TOKEN_SECRET_KEY and REFRESH_TOKEN_SECRET_KEY) must be configured in .env file');
    }
    
    this.jwtConfig = {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      refreshSecret: process.env.REFRESH_TOKEN_SECRET_KEY,
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

      // Check if email is verified
      if (!user.isEmailVerified) {
        return AuthLoginDto.error(
          errorCode.EMAIL_NOT_VERIFIED,
          "Please verify your email before logging in. Check your inbox for the verification code."
        );
      }

      // Check if user is banned
      if (!user.isActive) {
        return AuthLoginDto.error(
          errorCode.ACCOUNT_IS_BANNED,
          "Tài khoản đã bị khóa, vui lòng liên hệ admin để được hỗ trợ"
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
          status: user.isActive,
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

      // Save refresh token to database
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
      
      await this.userRepository.update(user._id, {
        refreshToken: refreshToken,
        refreshTokenExpiry: refreshTokenExpiry
      });

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

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, this.jwtConfig.refreshSecret);
      } catch (jwtError) {
        return AuthLoginDto.error(
          errorCode.TOKEN_EXPIRED,
          "Refresh token is invalid or expired"
        );
      }

      // Find user by ID from token
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        return AuthLoginDto.error(
          errorCode.USER_NOT_FOUND,
          "User not found"
        );
      }

      // Check if refresh token matches the one in database
      if (user.refreshToken !== refreshToken) {
        return AuthLoginDto.error(
          errorCode.REFRESH_TOKEN_FAILED,
          "Invalid refresh token. Please login again."
        );
      }

      // Check if refresh token expired in database
      if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
        // Clear expired token
        await this.userRepository.update(user._id, {
          refreshToken: null,
          refreshTokenExpiry: null
        });
        
        return AuthLoginDto.error(
          errorCode.TOKEN_EXPIRED,
          "Refresh token has expired. Please login again."
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return AuthLoginDto.error(
          errorCode.ACCOUNT_IS_BANNED,
          "Your account has been deactivated"
        );
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          status: user.isActive,
        },
        this.jwtConfig.secret,
        {
          expiresIn: this.jwtConfig.accessTokenExpiry,
        }
      );

      // Optionally generate new refresh token (token rotation)
      const newRefreshToken = jwt.sign(
        {
          userId: user._id,
        },
        this.jwtConfig.refreshSecret,
        {
          expiresIn: this.jwtConfig.refreshTokenExpiry,
        }
      );

      // Update refresh token in database
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
      
      await this.userRepository.update(user._id, {
        refreshToken: newRefreshToken,
        refreshTokenExpiry: refreshTokenExpiry
      });

      // Create response data
      const responseData = AuthLoginDto.toResponse(
        user,
        newAccessToken,
        newRefreshToken
      );

      return AuthLoginDto.success(
        responseData, 
        "Token refreshed successfully"
      );
    } catch (error) {
      return AuthLoginDto.error(
        errorCode.REFRESH_TOKEN_FAILED,
        "Failed to refresh token",
        error.message
      );
    }
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(userId) {
    try {
      // Clear refresh token from database
      await this.userRepository.update(userId, {
        refreshToken: null,
        refreshTokenExpiry: null
      });

      return AuthLoginDto.success(null, "Logged out successfully");
    } catch (error) {
      return AuthLoginDto.error(
        errorCode.LOGIN_FAILED,
        "Logout failed",
        error.message
      );
    }
  }
}

module.exports = AuthLoginService;
