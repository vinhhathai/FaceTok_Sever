"use strict";
//----------------------------------------------------------------
const UserModel = require('../models/UserModel');
const mongoose = require('mongoose');

/**
 * Repository xử lý dữ liệu người dùng
 */
class UserRepository {
    constructor() {
        this.model = UserModel;
    }


    async getBlockedUsers(userId) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                return null;
            }
            const populated = await this.model.findById(user._id).populate('blockedUsers', 'fullName profilePicture');
            
            if (!populated) {
                return null;
            }
            
            return {
                blockedUsers: populated.blockedUsers || []
            };
        } catch (error) {
            console.error(`Error getting blocked users for user ${userId}:`, error);
            throw error;
        }
    }

    async unblockUser(userId, blockedUserId) {
        try {
            const user = await this.findById(userId);
            const blockedUser = await this.findById(blockedUserId);
            
            if (!user || !blockedUser) {
                throw new Error('User not found');
            }
            
            const userObjectId = user._id;
            const blockedUserObjectId = blockedUser._id;
            
            return await this.model.findByIdAndUpdate(
                userObjectId,
                { $pull: { blockedUsers: blockedUserObjectId } },
                { new: true }
            );
        } catch (error) {
            console.error(`Error unblocking user ${blockedUserId} for user ${userId}:`, error);
            throw error;
        }
    }

    async blockUser(userId, blockedUserId) {
        try {
            const user = await this.findById(userId);
            const blockedUser = await this.findById(blockedUserId);
            
            if (!user || !blockedUser) {
                throw new Error('User not found');
            }
            
            const userObjectId = user._id;
            const blockedUserObjectId = blockedUser._id;
            
            // Use $addToSet to avoid duplicates and ensure idempotency
            return await this.model.findByIdAndUpdate(
                userObjectId,
                { $addToSet: { blockedUsers: blockedUserObjectId } },
                { new: true }
            );
        } catch (error) {
            console.error(`Error blocking user ${blockedUserId} for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Tìm người dùng theo ID
     * @param {string} id - ID của người dùng
     * @param {Object} projection - Các trường cần lấy hoặc loại bỏ
     * @returns {Promise<Object>} Thông tin người dùng
     */
    async findById(id, projection = {}) {
        try {
            if (mongoose.Types.ObjectId.isValid(id) && String(id).length === 24) {
                return await this.model.findById(id, projection);
            }
            return null;
        } catch (error) {
            console.error('Error in findById:', error);
            return null;
        }
    }

    /**
     * Tìm người dùng theo query bất kỳ
     * @param {Object} query - Query object
     * @param {Object} projection - Projection object
     * @returns {Promise<Object>} Thông tin người dùng
     */
    async findOne(query, projection = {}) {
        return this.model.findOne(query, projection);
    }

    /**
     * Tìm người dùng theo email
     * @param {string} email - Email của người dùng
     * @returns {Promise<Object>} Thông tin người dùng
     */
    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    /**
     * Tạo người dùng mới
     * @param {Object} userData - Dữ liệu người dùng mới
     * @returns {Promise<Object>} Thông tin người dùng đã tạo
     */
    async create(userData) {
        const user = new this.model(userData);
        return user.save();
    }

    /**
     * Cập nhật thông tin người dùng
     * @param {string} id - ID của người dùng
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<Object>} Thông tin người dùng sau khi cập nhật
     */
    async update(id, updateData) {
        return this.model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
    }

    async findBySearchTerm(searchTerm) {
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        return this.model.find({
            $or: [
                { fullName: { $regex: escapedSearchTerm, $options: 'i' } },
                { email: { $regex: escapedSearchTerm, $options: 'i' } }
            ]
        });
    }

    /**
     * Update user profile data
     * @param {string} userId - User ID to update
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated user document
     */
    async updateProfile(userId, profileData) {
        try {
            return await this.model.findByIdAndUpdate(
                userId,
                { $set: profileData },
                { 
                    new: true,             // Return updated document
                    runValidators: true,   // Run schema validators
                    lean: true             // Return plain JS object for better performance
                }
            ).select('-password -__v');    // Exclude sensitive fields
        } catch (error) {
            console.error(`Error updating profile for user ${userId}:`, error);
            throw error; // Propagate error to service layer for proper handling
        }
    }

    async updateAvatar(userId, profilePicture, profilePicturePublicId) {
        return this.model.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    profilePicture,
                    profilePicturePublicId: profilePicturePublicId || ""
                } 
            },
            { new: true }
        );
    }

    async updateThumbnail(userId, thumbnail, thumbnailPublicId) {
        return this.model.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    thumbnail,
                    thumbnailPublicId: thumbnailPublicId || ""
                } 
            },
            { new: true }
        );
    }

    /**
     * Update user's fullname and update time
     * @param {string} userId - User ID
     * @param {string} fullName - New fullname
     * @param {Date} lastNameUpdateTime - Update timestamp
     * @returns {Promise<Object>} Updated user information
     */
    async updateFullName(userId, fullName, lastNameUpdateTime) {
        return this.model.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    fullName,
                    lastNameUpdateTime
                } 
            },
            { new: true }
        );
    }

    async findByQueryPattern(queryPattern, limit = 20, skip = 0) {
        return this.model.find(queryPattern)
            .select('_id username fullName email profilePicture thumbnail bio')
            .skip(skip)
            .limit(limit);
    }

    async updateUserPassword(userId, hashedPassword) {
        return this.model.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );
    }

    async updateUserVerification(userId, verificationData) {
        return this.model.findByIdAndUpdate(
            userId,
            { verification: verificationData },
            { new: true }
        );
    }

    async createUser(userData) {
        const user = new this.model(userData);
        return await user.save();
    }

    async findByCondition(condition, projection = {}, options = {}) {
        return this.model.find(condition, projection, options);
    }

    async countByCondition(condition) {
        return this.model.countDocuments(condition);
    }

    async findAll(filter = {}, projection = {}, options = {}) {
        return this.model.find(filter, projection, options);
    }

    async countDocuments(filter = {}) {
        return this.model.countDocuments(filter);
    }

    async delete(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = UserRepository;