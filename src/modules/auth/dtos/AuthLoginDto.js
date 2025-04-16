"use strict";

/**
 * DTO cho xử lý đăng nhập
 */
class AuthLoginDto {
 
  constructor(data = {}) {
    this.email = data.email;
    this.password = data.password;
  }

  static toResponse(user, accessToken, refreshToken) {
    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture || null,
        thumbnail: user.thumbnail || null,
      },
      accessToken,
      refreshToken,
    };
  }
  
  static error(code, message, detail = null) {
    const response = {
      success: false,
      error: {
        code,
        message
      }
    };

    if (detail) {
      response.error.detail = detail;
    }

    return response;
  }

  static success(data = {}, message = "Success") {
    return {
      success: true,
      message,
      data
    };
  }

}

module.exports = AuthLoginDto;
