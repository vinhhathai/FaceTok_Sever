"use strict";
//----------------------------------------------------------------
const { AuthPasswordService, AuthRegisterService } = require('../services');
const { errorCode } = require('../../../shared/common/error');
const UserRepository = require('../../user/repositories/UserRepository');

class AuthPasswordController {
    constructor() {
        const userRepository = new UserRepository();
        this.authPasswordService = new AuthPasswordService();
        this.authRegisterService = new AuthRegisterService(userRepository);
    }
    
    resetPassword = async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;
            
            // Validate input
            if (!email || !otp || !newPassword) {
                return res.status(400).json({
                    timestamp: new Date().toISOString(),
                    path: "/auth/reset-password",
                    error: {
                        code: errorCode.INVALID_INPUT,
                        message: "Email, OTP and new password are required"
                    }
                });
            }
            
            // Validate password length
            if (newPassword.length < 6) {
                return res.status(400).json({
                    timestamp: new Date().toISOString(),
                    path: "/auth/reset-password",
                    error: {
                        code: errorCode.INVALID_PASSWORD,
                        message: "Password must be at least 6 characters long"
                    }
                });
            }
            
            const result = await this.authPasswordService.resetPassword(email, otp, newPassword);
            
            if (!result.success) {
                return res.status(result.statusCode).json({
                    timestamp: new Date().toISOString(),
                    path: "/auth/reset-password",
                    error: result.error
                });
            }
            
            return res.status(200).json({
                timestamp: new Date().toISOString(),
                path: "/auth/reset-password",
                data: {
                    message: "Password reset successfully"
                }
            });
        } catch (error) {
            console.error("Reset password controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/reset-password",
                error: {
                    code: errorCode.PASSWORD_RESET_FAILED,
                    message: "An error occurred during password reset"
                }
            });
        }
    }
    
    changePassword = async (req, res) => {
        try {
            const userId = req.user._id;
            const { currentPassword, newPassword } = req.body;
            
            const result = await this.authPasswordService.changePassword(userId, currentPassword, newPassword);
            
            if (!result.success) {
                return res.status(result.statusCode).json({
                    timestamp: new Date().toISOString(),
                    path: '/auth/change-password',
                    error: result.error
                });
            }
            
            return res.status(200).json({
                timestamp: new Date().toISOString(),
                path: '/auth/change-password',
                data: {
                    message: "Password changed successfully"
                }
            });
        } catch (error) {
            console.error("Change password controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/change-password",
                error: {
                    code: errorCode.CHANGE_PASSWORD_FAILED,
                    message: "An error occurred during password change"
                }
            });
        }
    }
    
    requestPasswordReset = async (req, res) => {
        try {
            const { email } = req.body;
            
            // Validate input
            if (!email) {
                return res.status(400).json({
                    timestamp: new Date().toISOString(),
                    path: "/auth/request-reset",
                    error: {
                        code: errorCode.INVALID_INPUT,
                        message: "Email is required"
                    }
                });
            }
            
            const result = await this.authRegisterService.requestPasswordReset(email);
            
            if (!result.success) {
                return res.status(result.statusCode).json({
                    timestamp: new Date().toISOString(),
                    path: "/auth/request-reset",
                    error: result.error
                });
            }
            
            return res.status(200).json({
                timestamp: new Date().toISOString(),
                path: "/auth/request-reset",
                data: {
                    message: "Password reset email sent successfully"
                }
            });
        } catch (error) {
            console.error("Request password reset controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/request-reset",
                error: {
                    code: errorCode.PASSWORD_RESET_FAILED,
                    message: "An error occurred during password reset request"
                }
            });
        }
    }
}

module.exports = AuthPasswordController; 