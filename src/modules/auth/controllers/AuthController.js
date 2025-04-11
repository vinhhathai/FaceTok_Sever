"use strict";
//----------------------------------------------------------------
const AuthService = require('../services/AuthService');

class AuthController {
    constructor() {
        this.authService = AuthService;
    }

    signUp = async (req, res) => {
        try {
            const userData = req.body;
            const result = await this.authService.signUp(userData);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? { message: "Account created successfully", status: true } 
                    : { 
                        timestamp: new Date().toISOString(),
                        path: "/auth/sign-up",
                        error: result.error 
                    }
            );
        } catch (error) {
            console.error("Sign up controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/sign-up",
                error: {
                    code: 'ERR_CREATE_ACCOUNT_FAILED',
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    loginToSystem = async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? { 
                        message: "Login successfully",
                        accessToken: result.data.accessToken,
                        refreshToken: result.data.refreshToken
                    } 
                    : { 
                        timestamp: new Date().toISOString(),
                        path: "/auth/login",
                        error: result.error 
                    }
            );
        } catch (error) {
            console.error("Login controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/login",
                error: {
                    code: 'ERR_LOGIN_FAILED',
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? { 
                        accessToken: result.data.accessToken,
                        refreshToken: result.data.refreshToken
                    } 
                    : { 
                        timestamp: new Date().toISOString(),
                        path: "/auth/refresh-token",
                        error: result.error 
                    }
            );
        } catch (error) {
            console.error("Refresh token controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/refresh-token",
                error: {
                    code: 'ERR_REFRESH_TOKEN_FAILED',
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    changePassword = async (req, res) => {
        try {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;
            
            const result = await this.authService.changePassword(userId, currentPassword, newPassword);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? { message: "Password changed successfully" } 
                    : { 
                        timestamp: new Date().toISOString(),
                        path: "/auth/change-password",
                        error: result.error 
                    }
            );
        } catch (error) {
            console.error("Change password controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/change-password",
                error: {
                    code: 'ERR_CHANGE_PASSWORD_FAILED',
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    resetPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const result = await this.authService.resetPassword(email);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? { message: "Password reset email sent successfully" } 
                    : { 
                        timestamp: new Date().toISOString(),
                        path: "/auth/reset-password",
                        error: result.error 
                    }
            );
        } catch (error) {
            console.error("Reset password controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/reset-password",
                error: {
                    code: 'ERR_RESET_PASSWORD_FAILED',
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    verifyOTP = async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await this.authService.verifyOTP(email, otp, newPassword);
            
            return res.status(result.statusCode).json(
                result.success 
                    ? { message: "OTP verified and password updated successfully" } 
                    : { 
                        timestamp: new Date().toISOString(),
                        path: "/auth/verify-otp",
                        error: result.error 
                    }
            );
        } catch (error) {
            console.error("Verify OTP controller error:", error);
            return res.status(500).json({
                timestamp: new Date().toISOString(),
                path: "/auth/verify-otp",
                error: {
                    code: 'ERR_VERIFY_OTP_FAILED',
                    message: error.message || "Internal server error"
                }
            });
        }
    }
}

// Xuất ra instance của controller thay vì class
module.exports = new AuthController(); 