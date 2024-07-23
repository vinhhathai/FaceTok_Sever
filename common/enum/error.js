'use strict';
//----------------------------------------------------------------
const errorCode = {
    VALIDATION_FAILED: "VALIDATION_FAILED",
    ERR_CREATE_ACCOUNT_FAILED: "ERR_CREATE_ACCOUNT_FAIL",
    DATA_CONFLICT: "DATA_CONFLICT",
    ERR_LOGIN_FAILED: "ERR_LOGIN_FAILED",
    DATA_NOT_FOUND: "DATA_NOT_FOUND",
    ACCOUNT_IS_BANNED: "ACCOUNT_IS_BANNED",
    UNAUTHORIZED: "UNAUTHORIZED",
    ERR_CREATE_ACCESS_TOKEN_FAILED: "ERR_CREATE_ACCESS_TOKEN_FAILED",
    EMAIL_SERVICE_UNAUTHORIZED: "EMAIL_SERVICE_UNAUTHORIZED",
    EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
    ERR_GET_RESET_PASSWORD_LINK_FAILED: "ERR_GET_RESET_PASSWORD_LINK_FAILED",
    ERR_CHANGE_PASSWORD_FAILED: "ERR_CHANGE_PASSWORD_FAILED"
};

const errorMessage = {
    EMAIL_EXISTED: "Email has existed already",
    USERNAME_EXISTED: "Username has existed already",
    UNKNOWN_ERROR: "Failure (unknown error)",
    DATA_NOT_FOUND: "Username or Password is not correct",
    ACCOUNT_IS_BANNED: "This account is banned",
    INVALID_TOKEN: "Invalid token",
    ERR_CREATE_ACCESS_TOKEN_FAILED: "Create access token failed",
    REFRESH_TOKEN_NOT_FOUND: "Refresh token not found",
    EMAIL_SERVICE_UNAUTHORIZED: "Email service is unauthorized",
    EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
    ERR_GET_RESET_PASSWORD_LINK_FAILED: "Failure (reset password)",
    EXPIRED_TOKEN: "Expired token",
    ERR_CHANGE_PASSWORD_FAILED: "Failure (change password)"
}

module.exports = { errorCode, errorMessage };
