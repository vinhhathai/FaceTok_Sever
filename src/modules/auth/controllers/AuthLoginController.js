"use strict";
//----------------------------------------------------------------
const { AuthLoginService } = require("../services");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AuthLoginDto } = require("../dtos");
const { loginValidation } = require("../validations/authValidation");

class AuthLoginController {
  constructor() {
    this.authLoginService = new AuthLoginService();
  }

  loginToSystem = async (req, res) => {
    try {
      // Validate input data using Joi
      const { error, value } = loginValidation.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: error.details[0].message
          },
          timestamp: new Date().toISOString()
        });
      }
      
      const result = await this.authLoginService.login(value.email, value.password);

      if (result.success) {
        // Set tokens in httpOnly cookies for security
        const { accessToken, refreshToken } = result.data;
        
        // Set access token cookie (7 days)
        res.cookie('auth_token', accessToken, {
          httpOnly: true,  // Cannot be accessed by JavaScript (XSS protection)
          secure: process.env.NODE_ENV === 'production', // HTTPS only in production
          sameSite: 'strict', // CSRF protection
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        
        // Set refresh token cookie (30 days)
        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        });
        
        // Return response without tokens (tokens are in cookies)
        return res.status(200).json({
          ...result,
          data: {
            user: result.data.user,
            // Tokens are in httpOnly cookies, don't send in response body
            accessToken: accessToken, // Still send for backward compatibility
            refreshToken: refreshToken
          }
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      return res.status(500).json({
        ...AuthLoginDto.error(
          errorCode.LOGIN_FAILED,
          errorMessage.LOGIN_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Refresh access token using refresh token
   */
  refreshToken = async (req, res) => {
    try {
      // Try to get refresh token from cookie first, then from body
      const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: "Refresh token is required"
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.authLoginService.refreshToken(refreshToken);

      if (result.success) {
        // Set new tokens in httpOnly cookies
        const { accessToken, refreshToken: newRefreshToken } = result.data;
        
        // Update access token cookie
        res.cookie('auth_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        // Update refresh token cookie
        res.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000
        });
        
        return res.status(200).json({
          ...result,
          data: {
            user: result.data.user,
            // Send tokens for backward compatibility
            accessToken: accessToken,
            refreshToken: newRefreshToken
          }
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      return res.status(500).json({
        ...AuthLoginDto.error(
          errorCode.REFRESH_TOKEN_FAILED,
          "Failed to refresh token",
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Logout - invalidate refresh token
   */
  logout = async (req, res) => {
    try {
      const userId = req.userId; // From checkLogin middleware

      const result = await this.authLoginService.logout(userId);

      if (result.success) {
        // Clear httpOnly cookies
        res.clearCookie('auth_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        return res.status(200).json({
          ...result
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      return res.status(500).json({
        ...AuthLoginDto.error(
          errorCode.LOGIN_FAILED,
          "Logout failed",
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = AuthLoginController;
