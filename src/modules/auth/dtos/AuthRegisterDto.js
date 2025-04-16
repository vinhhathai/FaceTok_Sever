"use strict";

/**
 * DTO cho xử lý đăng ký tài khoản
 */
class AuthRegisterDto {
    /**
     * Khởi tạo từ dữ liệu request đã được validate
     * @param {Object} data - Dữ liệu đăng ký từ request đã được validate bởi Joi
     */
    constructor(data = {}) {
        this.email = data.email;
        this.password = data.password;
        this.fullName = data.fullName;
        this.dateOfBirth = data.dateOfBirth;
        this.gender = data.gender;
    }

    /**
     * Chuẩn hóa dữ liệu trước khi xử lý
     */
    normalize() {
        this.email = AuthRegisterDto.normalizeEmail(this.email);
        this.fullName = this.fullName ? this.fullName.trim() : this.fullName;
        return this;
    }
    
    /**
     * Chuyển đổi dữ liệu cho việc tạo người dùng mới
     * @returns {Object} - Dữ liệu người dùng đã được chuẩn hóa
     */
    toCreateUserData() {
        return {
            email: this.email,
            password: this.password,
            fullName: this.fullName,
            dateOfBirth: this.dateOfBirth,
            gender: this.gender
        };
    }

    /**
     * Tạo response sau khi đăng ký thành công
     * @param {Object} user - Thông tin người dùng mới tạo
     * @returns {Object} - Response data
     */
    static toResponse(user) {
        return {
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName
            }
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

module.exports = AuthRegisterDto; 