"use strict";
//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for account registration handling
 */
class AuthRegisterDto {

    static toResponse(user) {
        return {
            id: user._id,
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