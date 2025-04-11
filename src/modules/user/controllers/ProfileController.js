"use strict";
//----------------------------------------------------------------
const ProfileService = require('../services/ProfileService');

class ProfileController {
    constructor() {
        this.profileService = ProfileService;
    }

    getProfile = async (req, res) => {
        const userId = req.params.id;
        
        const result = await this.profileService.getUserProfile(userId);
        
        if (result.success) {
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

    updateProfile = async (req, res) => {
        const userId = req.params.id;
        const profileData = req.body;
        
        // Đảm bảo không thể cập nhật password qua API này
        delete profileData.password;
        
        const result = await this.profileService.updateProfile(userId, profileData);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                user: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/user/update-profile/${userId}`,
                error: result.error 
            });
        }
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
        
        const result = await this.profileService.updateProfile(userId, { fullName });
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                user: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: '/user/update-fullname',
                error: result.error 
            });
        }
    }
}

module.exports = new ProfileController(); 