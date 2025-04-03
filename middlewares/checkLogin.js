'use strict';
//----------------------------------------------------------------
require('dotenv').config()
const UserModel = require('../models/UserModel')
const jwt = require('jsonwebtoken');
const { errorCode, errorMessage } = require('../common/enum/error');
const { role } = require('../common/enum/role')

const checkLogin = async (req, res, next) => {
    try {
        // Check login
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);
        
        const accessToken = authHeader?.split(' ')[1];
        console.log('Access token extracted:', accessToken?.substring(0, 20) + '...');
        
        if (!accessToken) {
            return res.status(401).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.UNAUTHORIZED,
                error: {
                    name: errorMessage.LOGIN_REQUIRED
                }
            });
        }
        
        // verify
        console.log('Verifying token with key:', process.env.ACCESS_TOKEN_SECRET_KEY.substring(0, 5) + '...');
        try {
            const token = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
            console.log('Token verified successfully, user ID:', token._id);
            
            // check role
            const user = await UserModel.findById(token._id);
            
            if (!user) {
                console.log('User not found with ID:', token._id);
                return res.status(404).json({
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    code: errorCode.DATA_NOT_FOUND,
                    error: {
                        name: errorMessage.USER_NOT_FOUND
                    }
                });
            }
            
            console.log('User found, role:', user.role);

            if (user.role !== role.MEMBER) {
                return res.status(403).json({
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    code: errorCode.NOT_PERMISSIONS,
                    error: {
                        name: errorMessage.NOT_PERMISSIONS
                    }
                });
            }
            
            // Add user_id to req.user
            req.user = {
                user_id: token._id
            };
            
            // Proceed to next middleware
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
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
        console.error('CheckLogin middleware error:', error);
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

module.exports = checkLogin;