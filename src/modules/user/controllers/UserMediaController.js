"use strict";
//----------------------------------------------------------------
const UserMediaService = require('../services/UserMediaService');

class UserMediaController {
    constructor() {
        this.userMediaService = UserMediaService;
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
        
        const result = await this.userMediaService.updateAvatar(userId, profilePicture);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                data: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: '/user/update-avatar-url',
                error: result.error 
            });
        }
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
        
        const result = await this.userMediaService.updateThumbnail(userId, thumbnail);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                data: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: '/user/update-thumbnail-url',
                error: result.error 
            });
        }
    }
}

module.exports = new UserMediaController(); 