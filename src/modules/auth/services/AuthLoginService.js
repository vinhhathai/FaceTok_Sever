"use strict";
//----------------------------------------------------------------
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserRepository = require('../../user/repositories/UserRepository');

class AuthLoginService {
    async login(username, password) {
        try {
            // Tìm người dùng theo username
            const user = await UserRepository.findByUsername(username);
            if (!user) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Username or password is incorrect'
                    }
                };
            }
            
            // Kiểm tra mật khẩu
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Username or password is incorrect'
                    }
                };
            }
            
            // Tạo token
            const accessToken = jwt.sign(
                { id: user._id, username: user.username },
                config.jwt.secret,
                { expiresIn: config.jwt.accessTokenExpiry }
            );
            
            const refreshToken = jwt.sign(
                { id: user._id, username: user.username },
                config.jwt.refreshSecret,
                { expiresIn: config.jwt.refreshTokenExpiry }
            );
            
            // Cập nhật refreshToken trong database
            user.refreshToken = refreshToken;
            await user.save();
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user._id,
                        username: user.username,
                        fullName: user.profile.fullName,
                        profilePicture: user.profile.profilePicture,
                        thumbnail: user.profile.thumbnail,
                        email: user.email
                    }
                }
            };
        } catch (error) {
            console.error('Error in login:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'An error occurred during login');
        }
    }
    
    async refreshToken(refreshToken) {
        try {
            // Xác thực refreshToken
            let payload;
            try {
                payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
            } catch (error) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: 'INVALID_TOKEN',
                        message: 'Invalid refresh token'
                    }
                };
            }
            
            // Tìm người dùng và kiểm tra token
            const user = await UserRepository.findById(payload.id);
            if (!user || user.refreshToken !== refreshToken) {
                return {
                    success: false,
                    statusCode: 401,
                    error: {
                        code: 'INVALID_TOKEN',
                        message: 'Invalid refresh token'
                    }
                };
            }
            
            // Tạo token mới
            const newAccessToken = jwt.sign(
                { id: user._id, username: user.username },
                config.jwt.secret,
                { expiresIn: config.jwt.accessTokenExpiry }
            );
            
            const newRefreshToken = jwt.sign(
                { id: user._id, username: user.username },
                config.jwt.refreshSecret,
                { expiresIn: config.jwt.refreshTokenExpiry }
            );
            
            // Cập nhật refreshToken mới
            user.refreshToken = newRefreshToken;
            await user.save();
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            };
        } catch (error) {
            console.error('Error in refreshToken:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'An error occurred during token refresh');
        }
    }
    
    async logout(userId) {
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
            
            // Xóa refreshToken
            user.refreshToken = null;
            await user.save();
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    message: 'Logged out successfully'
                }
            };
        } catch (error) {
            console.error('Error in logout:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'An error occurred during logout');
        }
    }
}

module.exports = new AuthLoginService();