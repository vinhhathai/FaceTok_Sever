"use strict";
//----------------------------------------------------------------
const { AuthRegisterService } = require('../services');

class AuthRegisterController {
    constructor() {
        this.authRegisterService = AuthRegisterService;
    }
    
    signUp = async (req, res) => {
        const { username, email, password, fullName } = req.body;
        
        // Validate input
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/sign-up',
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'All fields are required (username, email, password, fullName)'
                }
            });
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/sign-up',
                error: {
                    code: 'INVALID_EMAIL',
                    message: 'Please provide a valid email address'
                }
            });
        }
        
        // Username validation
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/sign-up',
                error: {
                    code: 'INVALID_USERNAME',
                    message: 'Username must be between 3 and 20 characters'
                }
            });
        }
        
        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/sign-up',
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Password must be at least 6 characters'
                }
            });
        }
        
        const result = await this.authRegisterService.register({
            username,
            email,
            password,
            fullName
        });
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/sign-up',
                    error: result.error 
                }
        );
    }
    
    verifyOTP = async (req, res) => {
        const { userId, otp } = req.body;
        
        if (!userId || !otp) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/verify-otp',
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'User ID and OTP are required'
                }
            });
        }
        
        const result = await this.authRegisterService.verifyOTP(userId, otp);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/verify-otp',
                    error: result.error 
                }
        );
    }
}

module.exports = new AuthRegisterController(); 