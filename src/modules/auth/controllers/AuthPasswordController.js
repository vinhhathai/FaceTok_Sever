"use strict";
//----------------------------------------------------------------
const { AuthPasswordService, AuthRegisterService } = require('../services');

class AuthPasswordController {
    constructor() {
        this.authPasswordService = AuthPasswordService;
        this.authRegisterService = AuthRegisterService;
    }
    
    resetPassword = async (req, res) => {
        const { userId, otp, newPassword } = req.body;
        
        if (!userId || !otp || !newPassword) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/reset-password',
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'User ID, OTP, and new password are required'
                }
            });
        }
        
        // Validate password
        if (newPassword.length < 6) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/reset-password',
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Password must be at least 6 characters'
                }
            });
        }
        
        const result = await this.authPasswordService.resetPassword(userId, otp, newPassword);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/reset-password',
                    error: result.error 
                }
        );
    }
    
    changePassword = async (req, res) => {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/change-password',
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'Current password and new password are required'
                }
            });
        }
        
        // Validate password
        if (newPassword.length < 6) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/change-password',
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Password must be at least 6 characters'
                }
            });
        }
        
        const result = await this.authPasswordService.changePassword(userId, currentPassword, newPassword);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/change-password',
                    error: result.error 
                }
        );
    }
    
    requestPasswordReset = async (req, res) => {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/request-reset',
                error: {
                    code: 'MISSING_EMAIL',
                    message: 'Email is required'
                }
            });
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/request-reset',
                error: {
                    code: 'INVALID_EMAIL',
                    message: 'Please provide a valid email address'
                }
            });
        }
        
        const result = await this.authRegisterService.requestPasswordReset(email);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/request-reset',
                    error: result.error 
                }
        );
    }
}

module.exports = new AuthPasswordController(); 