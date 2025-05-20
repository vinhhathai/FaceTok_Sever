"use strict";

//----------------------------------------------------------------
const { dtoResponse } = require("../../../shared/helper");

/**
 * DTO for password-related operations
 */
class AuthPasswordDto {
    /**
     * Create DTO for password reset request
     * @param {Object} data - Validated request data
     */
    static toResetRequestData(data) {
        return {
            email: AuthPasswordDto.normalizeEmail(data.email)
        };
    }

    /**
     * Create DTO for OTP verification
     * @param {Object} data - Validated request data
     */
    static toOtpVerificationData(data) {
        // Ensure email is normalized
        let email = data.email;
        if (typeof email === 'string') {
            email = email.toLowerCase().trim();
        }
        
        // Ensure OTP is always a string
        let otp = data.otp;
        if (otp !== undefined) {
            otp = String(otp).trim();
        }
        
        return {
            email: email,
            otp: otp
        };
    }

    /**
     * Create DTO for password reset
     * @param {Object} data - Validated request data
     */
    static toPasswordResetData(data) {
        return {
            newPassword: data.newPassword,
            token: data.token
        };
    }

    /**
     * Create response for successful OTP verification
     * @param {string} token - Reset token
     * @returns {Object} - Response data
     */
    static toOtpVerificationResponse(token) {
        return {
            resetToken: token
        };
    }

    /**
     * Create response for reset token
     * @param {string} email - Verified email
     * @param {string} token - Reset token
     * @returns {Object} - Response data
     */
    static toTokenResponse(email, token) {
        return {
            email,
            resetToken: token
        };
    }
    
    /**
     * Create error response format
     * @param {string} code - Error code
     * @param {string} message - Error message
     * @param {any} detail - Error details (if any)
     */
    static error(code, message, detail = null) {
        return dtoResponse.error(code, message, detail);
    }

    /**
     * Create success response format
     * @param {any} data - Response data
     * @param {string} message - Success message
     */
    static success(data = {}, message = "Success") {
        return dtoResponse.success(data, message);
    }

    /**
     * Normalize email
     * @param {string} email - Email to normalize
     * @returns {string} - Normalized email
     */
    static normalizeEmail(email) {
        return email ? email.toLowerCase().trim() : email;
    }
}

module.exports = AuthPasswordDto; 