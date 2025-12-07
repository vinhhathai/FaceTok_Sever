"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");
const { getPublicUserId } = require("../../../shared/utils/securityHelper");

/**
 * DTO for account registration handling
 */
class AuthRegisterDto {

    static toResponse(user) {
        return {
            id: getPublicUserId(user),
            email: user.email,
            fullName: user.fullName
        };
    }
    
    static error(code, message, detail = null) {
        return dtoResponse.error(code, message, detail);
    }

    static success(data = {}, message = "Success") {
        return dtoResponse.success(data, message);
    }
}

module.exports = AuthRegisterDto; 