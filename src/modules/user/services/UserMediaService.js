"use strict";
//----------------------------------------------------------------
const UserRepository = require('../repositories/UserRepository');

class UserMediaService {
    async updateAvatar(userId, profilePicture) {
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

            // Cập nhật avatar
            user.profile.profilePicture = profilePicture;
            await user.save();

            // Trả về kết quả thành công
            return {
                success: true,
                statusCode: 200,
                data: {
                    profilePicture: user.profile.profilePicture
                }
            };
        } catch (error) {
            console.error('Error updating avatar:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to update avatar');
        }
    }

    async updateThumbnail(userId, thumbnail) {
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

            // Cập nhật thumbnail
            user.profile.thumbnail = thumbnail;
            await user.save();

            // Trả về kết quả thành công
            return {
                success: true,
                statusCode: 200,
                data: {
                    thumbnail: user.profile.thumbnail
                }
            };
        } catch (error) {
            console.error('Error updating thumbnail:', error);
            return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to update thumbnail');
        }
    }
}

module.exports = new UserMediaService(); 