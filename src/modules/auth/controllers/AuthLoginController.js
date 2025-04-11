"use strict";
//----------------------------------------------------------------
const { AuthLoginService } = require('../services');

class AuthLoginController {
    constructor() {
        this.authLoginService = AuthLoginService;
    }
    
    loginToSystem = async (req, res) => {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/login',
                error: {
                    code: 'MISSING_CREDENTIALS',
                    message: 'Username and password are required'
                }
            });
        }
        
        const result = await this.authLoginService.login(username, password);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/login',
                    error: result.error 
                }
        );
    }
    
    refreshToken = async (req, res) => {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/auth/refresh-token',
                error: {
                    code: 'MISSING_TOKEN',
                    message: 'Refresh token is required'
                }
            });
        }
        
        const result = await this.authLoginService.refreshToken(refreshToken);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/refresh-token',
                    error: result.error 
                }
        );
    }
    
    logout = async (req, res) => {
        const userId = req.user.id;
        
        const result = await this.authLoginService.logout(userId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/auth/logout',
                    error: result.error 
                }
        );
    }
}

module.exports = new AuthLoginController(); 