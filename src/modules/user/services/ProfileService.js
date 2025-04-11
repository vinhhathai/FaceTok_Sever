"use strict";
//----------------------------------------------------------------
const UserRepository = require('../repositories/UserRepository');
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class ProfileService {
    constructor() {
        this.userRepository = new UserRepository();
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
}

module.exports = new ProfileService(); 