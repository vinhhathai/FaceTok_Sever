"use strict";
//----------------------------------------------------------------
const UserModel = require('../models/UserModel');

class UserRepository {
    constructor() {
        this.model = UserModel;
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async findByEmail(email) {
        return this.model.findOne({ email: email });
    }

    async create(userData) {
        const newUser = new this.model(userData);
        return await newUser.save();
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