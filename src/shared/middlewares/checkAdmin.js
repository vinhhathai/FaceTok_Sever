'use strict';
//----------------------------------------------------------------
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { errorCode, errorMessage } = require('../common/error');
const { role } = require('../common/constants');
const UserModel = require('../../modules/user/models/UserModel');
const logger = require('../utils/logger');

/**
 * Middleware để check quyền admin
 * Chỉ cho phép admin và staff truy cập
 * Note: Middleware này tự verify token, không cần dùng checkLogin trước
 */
const checkAdmin = async (req, res, next) => {
    try {
        // Check authorization - Try cookie first (httpOnly), then fallback to Authorization header
        const accessToken = req.cookies?.auth_token || 
                           req.headers.authorization?.split(' ')[1];
        
        if (!accessToken) {
            return res.status(401).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.UNAUTHORIZED,
                error: {
                    name: errorMessage.LOGIN_REQUIRED,
                    message: 'No access token found in cookie or header'
                }
            });
        }
        
        // Verify token
        try {
            const token = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
            const userId = token.userId || token._id;
            
            if (!userId) {
                logger.error('Token missing userId:', { token: token });
                return res.status(401).json({
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    code: errorCode.UNAUTHORIZED,
                    error: {
                        name: 'invalid_token',
                        message: 'Token does not contain user ID'
                    }
                });
            }
            
            // Get user from database
            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    code: errorCode.DATA_NOT_FOUND,
                    error: {
                        name: errorMessage.USER_NOT_FOUND
                    }
                });
            }
            
            // Check if user is admin or staff
            if (user.role !== role.ADMIN && user.role !== role.STAFF) {
                return res.status(403).json({
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    code: errorCode.NOT_PERMISSIONS,
                    error: {
                        name: errorMessage.NOT_PERMISSIONS,
                        message: 'Admin or Staff role required'
                    }
                });
            }
            
            // Add user info to req.user
            req.user = {
                id: userId,
                role: user.role
            };
            
            next();
        } catch (jwtError) {
            logger.error('JWT verification error:', { error: jwtError.message, stack: jwtError.stack });
            return res.status(401).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.UNAUTHORIZED,
                error: {
                    name: 'invalid_token',
                    message: jwtError.message
                }
            });
        }
    } catch (error) {
        logger.error('CheckAdmin middleware error:', { error: error.message, stack: error.stack });
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            code: errorCode.CHECK_AUTHORIZATION_FAILED,
            error: {
                name: error.message
            }
        });
    }
}

module.exports = checkAdmin;
