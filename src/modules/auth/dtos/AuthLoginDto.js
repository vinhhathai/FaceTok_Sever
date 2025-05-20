"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for login handling
 */
class AuthLoginDto {

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
    return dtoResponse.error(code, message, detail);
  }

  static success(data = {}, message = "Success") {
    return dtoResponse.success(data, message);
  }

}

module.exports = AuthLoginDto;
