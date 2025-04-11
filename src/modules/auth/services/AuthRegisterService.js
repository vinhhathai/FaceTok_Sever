"use strict";
//----------------------------------------------------------------
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserRepository = require('../../../repositories/UserRepository');
const { createErrorResponse } = require('../../../utils/responseUtils');
const EmailService = require('../../../shared/services/EmailService');

class AuthRegisterService {
    async register(userData) {
        try {
            // Kiểm tra username đã tồn tại chưa
            const existingUser = await UserRepository.findByUsername(userData.username);
            if (existingUser) {
                return {
                    success: false,
                    statusCode: 409,
                    error: {
                        code: 'USERNAME_ALREADY_EXISTS',
                        message: 'Username already exists'
                    }
                };
            }
            
            // Kiểm tra email đã tồn tại chưa
            const existingEmail = await UserRepository.findByEmail(userData.email);
            if (existingEmail) {
                return {
                    success: false,
                    statusCode: 409,
                    error: {
                        code: 'EMAIL_ALREADY_EXISTS',
                        message: 'Email already exists'
                    }
                };
            }
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            
            // Tạo OTP để xác thực
            const otp = this.generateOTP();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP hết hạn sau 10 phút
            
            // Tạo người dùng mới
            const newUser = await UserRepository.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                profile: {
                    fullName: userData.fullName,
                    bio: '',
                    profilePicture: 'https://via.placeholder.com/150',
                    thumbnail: 'https://via.placeholder.com/50'
                },
                verification: {
                    isVerified: false,
                    otp: otp,
                    otpExpiry: otpExpiry
                }
            });
            
            // Gửi email xác thực
            await EmailService.sendVerificationEmail(userData.email, otp);
            
            return {
                success: true,
                statusCode: 201,
                data: {
                    message: 'User registered successfully. Please verify your email.',
                    userId: newUser._id
                }
            };
        } catch (error) {
            console.error('Error in register:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'An error occurred during registration');
        }
    }
    
    async verifyOTP(userId, otp) {
        try {
            // Tìm người dùng
            const user = await UserRepository.findById(userId);
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    }
                };
            }
            
            // Kiểm tra OTP
            if (user.verification.otp !== otp) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_OTP',
                        message: 'Invalid OTP'
                    }
                };
            }
            
            // Kiểm tra thời hạn OTP
            if (new Date() > user.verification.otpExpiry) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'OTP_EXPIRED',
                        message: 'OTP has expired'
                    }
                };
            }
            
            // Xác thực người dùng
            user.verification.isVerified = true;
            user.verification.otp = null;
            user.verification.otpExpiry = null;
            await user.save();
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    message: 'Email verified successfully'
                }
            };
        } catch (error) {
            console.error('Error in verifyOTP:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'An error occurred during OTP verification');
        }
    }
    
    async requestPasswordReset(email) {
        try {
            // Tìm người dùng theo email
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: 'EMAIL_NOT_FOUND',
                        message: 'No user found with this email'
                    }
                };
            }
            
            // Tạo OTP để đặt lại mật khẩu
            const otp = this.generateOTP();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP hết hạn sau 10 phút
            
            // Cập nhật OTP cho người dùng
            user.verification.otp = otp;
            user.verification.otpExpiry = otpExpiry;
            await user.save();
            
            // Gửi email với OTP
            await EmailService.sendPasswordResetEmail(email, otp);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    message: 'Password reset OTP sent to your email',
                    userId: user._id
                }
            };
        } catch (error) {
            console.error('Error in requestPasswordReset:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'An error occurred during password reset request');
        }
    }
    
    // Hàm sinh OTP ngẫu nhiên
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

module.exports = new AuthRegisterService(); 