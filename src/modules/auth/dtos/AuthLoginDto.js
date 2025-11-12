"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");
const { sanitizeUser } = require("../../../shared/utils/securityHelper");

/**
 * DTO for login handling
 */
class AuthLoginDto {

  static toResponse(user, accessToken, refreshToken) {
    return {
      user: sanitizeUser(user, { includeEmail: true, includeRole: true }),
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
