"use strict";
//----------------------------------------------------------------
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AuthRepository = require('../repositories/AuthRepository');
const { errorCode, errorMessage } = require('../../../shared/common/error');

class AuthService {
    constructor() {
        this.authRepository = new AuthRepository();
    }

    async signUp(userData) {
        try {
            // Check if email exists
            const emailExists = await this.authRepository.findUserByEmail(userData.email);
            if (emailExists) {
                return {
                    success: false,
                    statusCode: 409,
                    error: {
                        code: errorCode.DATA_CONFLICT,
                        message: errorMessage.EMAIL_EXISTED
                    }
                };
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create new user
            const newUserData = {
                ...userData,
                password: hashedPassword,
                isActive: true
            };

            await this.authRepository.createUser(newUserData);

            return {
                success: true,
                statusCode: 201
            };
        } catch (error) {
            console.error("Sign up service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }

    async login(email, password) {
        try {
            // Find user by email
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.DATA_NOT_FOUND,
                        message: errorMessage.DATA_NOT_FOUND
                    }
                };
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: errorCode.UNAUTHORIZED,
                        message: "Invalid password"
                    }
                };
            }

            // Check if account is active
            if (!user.isActive) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.ACCOUNT_IS_BANNED,
                        message: errorMessage.ACCOUNT_IS_BANNED
                    }
                };
            }

            // Generate tokens
            const accessToken = jwt.sign(
                { 
                    _id: user._id,
                    profilePicture: user.profilePicture,
                    fullName: user.fullName,
                    thumbnail: user.thumbnail,
                    bio: user.bio
                },
                process.env.ACCESS_TOKEN_SECRET_KEY,
                { expiresIn: "7d" }
            );

            const refreshToken = jwt.sign(
                { _id: user._id },
                process.env.REFRESH_TOKEN_SECRET_KEY,
                { expiresIn: "7d" }
            );

            return {
                success: true,
                statusCode: 200,
                data: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            console.error("Login service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }

    async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: errorCode.INVALID_INPUT,
                        message: "Refresh token is required"
                    }
                };
            }

            try {
                // Verify refresh token
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
                
                // Find user
                const user = await this.authRepository.findUserById(decoded._id);
                if (!user) {
                    return {
                        success: false,
                        statusCode: 404,
                        error: {
                            code: errorCode.DATA_NOT_FOUND,
                            message: errorMessage.USER_NOT_FOUND
                        }
                    };
                }

                // Generate new tokens
                const newAccessToken = jwt.sign(
                    { 
                        _id: user._id,
                        profilePicture: user.profilePicture,
                        fullName: user.fullName,
                        thumbnail: user.thumbnail,
                        bio: user.bio
                    },
                    process.env.ACCESS_TOKEN_SECRET_KEY,
                    { expiresIn: "7d" }
                );

                const newRefreshToken = jwt.sign(
                    { _id: user._id },
                    process.env.REFRESH_TOKEN_SECRET_KEY,
                    { expiresIn: "7d" }
                );

                return {
                    success: true,
                    statusCode: 200,
                    data: {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: errorCode.UNAUTHORIZED,
                        message: "Invalid refresh token"
                    }
                };
            }
        } catch (error) {
            console.error("Refresh token service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            if (!userId || !currentPassword || !newPassword) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: errorCode.INVALID_INPUT,
                        message: "User ID, current password, and new password are required"
                    }
                };
            }

            // Find user
            const user = await this.authRepository.findUserById(userId);
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.DATA_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: errorCode.UNAUTHORIZED,
                        message: "Current password is incorrect"
                    }
                };
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            await this.authRepository.updateUserPassword(userId, hashedPassword);

            return {
                success: true,
                statusCode: 200
            };
        } catch (error) {
            console.error("Change password service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }

    async resetPassword(email) {
        try {
            if (!email) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: errorCode.INVALID_INPUT,
                        message: "Email is required"
                    }
                };
            }

            // Find user by email
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.DATA_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }

            // Generate OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

            // Store OTP
            await this.authRepository.storeResetOTP(user._id, otp, otpExpiry);

            // In a real application, you would send this OTP via email
            console.log(`OTP for ${email}: ${otp}`);

            return {
                success: true,
                statusCode: 200
            };
        } catch (error) {
            console.error("Reset password service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }

    async verifyOTP(email, otp, newPassword) {
        try {
            if (!email || !otp || !newPassword) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: errorCode.INVALID_INPUT,
                        message: "Email, OTP, and new password are required"
                    }
                };
            }

            // Find user by email
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.DATA_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }

            // Verify OTP
            const isValidOTP = await this.authRepository.verifyResetOTP(user._id, otp);
            if (!isValidOTP) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: errorCode.UNAUTHORIZED,
                        message: "Invalid or expired OTP"
                    }
                };
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password and clear OTP
            await this.authRepository.updateUserPassword(user._id, hashedPassword);
            await this.authRepository.clearResetOTP(user._id);

            return {
                success: true,
                statusCode: 200
            };
        } catch (error) {
            console.error("Verify OTP service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }
}

// Export instance của service
module.exports = new AuthService(); 