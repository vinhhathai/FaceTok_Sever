"use strict";
//----------------------------------------------------------------
const UserService = require('../services/UserService');

class UserController {
    constructor() {
        this.userService = UserService;
    }

    getProfile = async (req, res) => {
        const userId = req.params.id;
        
        const result = await this.userService.getUserProfile(userId);
        
        if (result.success) {
            // Format response to match client expectations
            return res.status(result.statusCode).json({
                success: true,
                user: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/user/profile/${userId}`,
                error: result.error 
            });
        }
    }

    updateAvatar = async (req, res) => {
        const userId = req.user.id; // Từ middleware authentication
        const { profilePicture } = req.body;
        
        if (!profilePicture) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/user/update-avatar-url',
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Avatar URL is required'
                }
            });
        }
        
        const result = await this.userService.updateAvatar(userId, profilePicture);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/user/update-avatar-url',
                    error: result.error 
                }
        );
    }

    updateThumbnail = async (req, res) => {
        const userId = req.user.id; // Từ middleware authentication
        const { thumbnail } = req.body;
        
        if (!thumbnail) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/user/update-thumbnail-url',
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Thumbnail URL is required'
                }
            });
        }
        
        const result = await this.userService.updateThumbnail(userId, thumbnail);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/user/update-thumbnail-url',
                    error: result.error 
                }
        );
    }

    updateFullName = async (req, res) => {
        const userId = req.user.id; // Từ middleware authentication
        const { fullName } = req.body;
        
        if (!fullName) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/user/update-fullname',
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Full name is required'
                }
            });
        }
        
        const result = await this.userService.updateProfile(userId, { fullName });
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/user/update-fullname',
                    error: result.error 
                }
        );
    }

    updateProfile = async (req, res) => {
        const userId = req.params.id;
        const profileData = req.body;
        
        // Đảm bảo không thể cập nhật password qua API này
        delete profileData.password;
        
        const result = await this.userService.updateProfile(userId, profileData);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/user/update-profile/${userId}`,
                    error: result.error 
                }
        );
    }

    searchUsers = async (req, res) => {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const skip = (page - 1) * limit;
        const result = await this.userService.searchUsers(query, limit, skip);
        
        // Always return response in consistent client-compatible format
        return res.status(result.statusCode).json(
            result.success 
                ? { 
                    success: true,
                    users: result.data.map(user => ({
                        _id: user._id,
                        fullName: user.fullName,
                        email: user.email, 
                        profilePicture: user.profilePicture,
                        thumbnail: user.thumbnail
                    }))
                } 
                : { 
                    success: false,
                    message: result.error.message
                }
        );
    }
}

// Xuất ra instance của controller thay vì class
module.exports = new UserController(); 