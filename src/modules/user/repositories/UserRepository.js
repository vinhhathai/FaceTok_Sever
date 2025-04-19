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

    /**
     * Tìm người dùng theo ID
     * @param {string} id - ID của người dùng
     * @param {Object} projection - Các trường cần lấy hoặc loại bỏ
     * @returns {Promise<Object>} Thông tin người dùng
     */
    async findById(id, projection = {}) {
        return this.model.findById(id, projection);
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

    async updateProfile(userId, profileData) {
        return this.model.findByIdAndUpdate(
            userId,
            { $set: profileData },
            { new: true, runValidators: true }
        );
    }

    async updateAvatar(userId, profilePicture) {
        return this.model.findByIdAndUpdate(
            userId,
            { $set: { profilePicture } },
            { new: true }
        );
    }

    async updateThumbnail(userId, thumbnail) {
        return this.model.findByIdAndUpdate(
            userId,
            { $set: { thumbnail } },
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
        return user.save();
    }
}

// Export class
module.exports = UserRepository; 