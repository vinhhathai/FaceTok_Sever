"use strict";

/**
 * DTO cho xử lý các thao tác liên quan đến mật khẩu
 */
class AuthPasswordDto {
    /**
     * Tạo DTO cho yêu cầu đặt lại mật khẩu
     * @param {Object} data - Dữ liệu từ request đã được validate
     */
    static toResetRequestData(data) {
        return {
            email: AuthPasswordDto.normalizeEmail(data.email)
        };
    }

    /**
     * Tạo DTO cho xác thực OTP
     * @param {Object} data - Dữ liệu từ request đã được validate
     */
    static toOtpVerificationData(data) {
        // Đảm bảo email được chuẩn hóa
        let email = data.email;
        if (typeof email === 'string') {
            email = email.toLowerCase().trim();
        }
        
        // Đảm bảo OTP luôn là string
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
     * Tạo DTO cho đặt lại mật khẩu
     * @param {Object} data - Dữ liệu từ request đã được validate
     */
    static toPasswordResetData(data) {
        return {
            newPassword: data.newPassword,
            token: data.token
        };
    }

    /**
     * Tạo response cho việc xác thực OTP thành công
     * @param {string} token - Reset token
     * @returns {Object} - Response data
     */
    static toOtpVerificationResponse(token) {
        return {
            resetToken: token
        };
    }
    
    /**
     * Tạo error response format
     * @param {string} code - Mã lỗi
     * @param {string} message - Thông báo lỗi
     * @param {any} detail - Chi tiết lỗi (nếu có)
     */
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

    /**
     * Tạo success response format
     * @param {any} data - Dữ liệu trả về
     * @param {string} message - Thông báo thành công
     */
    static success(data = {}, message = "Success") {
        return {
            success: true,
            message,
            data
        };
    }

    /**
     * Normalize (chuẩn hóa) email
     * @param {string} email - Email cần chuẩn hóa
     * @returns {string} - Email sau khi chuẩn hóa
     */
    static normalizeEmail(email) {
        return email ? email.toLowerCase().trim() : email;
    }
}

module.exports = AuthPasswordDto; 