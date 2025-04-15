"use strict";
//----------------------------------------------------------------
const UserRepository = require('../repositories/UserRepository');
const { errorCode, errorMessage } = require('../../../shared/common/error');

class UserService {
    constructor() {
        this.userRepository = UserRepository;
    }

    async getUserProfile(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.USER_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }

            // Loại bỏ thông tin nhạy cảm trước khi trả về
            const { password, otp, otpExpiry, ...userProfile } = user.toObject();
            
            return {
                success: true,
                statusCode: 200,
                data: userProfile
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.GET_PROFILE_FAILED,
                    message: error.message
                }
            };
        }
    }

    async updateAvatar(userId, avatarUrl) {
        try {
            const updatedUser = await this.userRepository.updateAvatar(userId, avatarUrl);
            
            if (!updatedUser) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.USER_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    profilePicture: updatedUser.profilePicture
                }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.UPDATE_AVATAR_FAILED,
                    message: error.message
                }
            };
        }
    }

    async updateThumbnail(userId, thumbnailUrl) {
        try {
            const updatedUser = await this.userRepository.updateThumbnail(userId, thumbnailUrl);
            
            if (!updatedUser) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.USER_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    thumbnail: updatedUser.thumbnail
                }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.UPDATE_THUMBNAIL_FAILED,
                    message: error.message
                }
            };
        }
    }

    async updateProfile(userId, profileData) {
        try {
            const updatedUser = await this.userRepository.updateProfile(userId, profileData);
            
            if (!updatedUser) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.USER_NOT_FOUND,
                        message: errorMessage.USER_NOT_FOUND
                    }
                };
            }
            
            // Loại bỏ thông tin nhạy cảm trước khi trả về
            const { password, otp, otpExpiry, ...userProfile } = updatedUser.toObject();
            
            return {
                success: true,
                statusCode: 200,
                data: userProfile
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.UPDATE_PROFILE_FAILED,
                    message: error.message
                }
            };
        }
    }

    async searchUsers(query, limit = 20, skip = 0) {
        try {
            if (!query) {
                return {
                    success: false,
                    statusCode: 400,
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'Search query is required'
                    }
                };
            }
            
            const searchPattern = new RegExp(query, 'i');
            
            const users = await this.userRepository.findByQueryPattern({
                $or: [
                    { fullName: searchPattern },
                    { email: searchPattern }
                ]
            }, limit, skip);
            
            return {
                success: true,
                statusCode: 200,
                data: users
            };
        } catch (error) {
            console.error("Search users service error:", error);
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }
}

module.exports = UserService; 