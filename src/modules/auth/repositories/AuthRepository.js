"use strict";
//----------------------------------------------------------------
const UserModel = require('../../user/models/UserModel');

class AuthRepository {
    constructor() {
        this.userModel = UserModel;
    }

    async findUserByEmail(email) {
        return this.userModel.findOne({ email });
    }

    async findUserById(id) {
        return this.userModel.findById(id);
    }

    async createUser(userData) {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

    async updateUserPassword(userId, hashedPassword) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { password: hashedPassword }
        );
    }

    async storeResetOTP(userId, otp, expiryTime) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { 
                resetPasswordOTP: otp,
                resetPasswordOTPExpiry: expiryTime
            }
        );
    }

    async verifyResetOTP(userId, otp) {
        const user = await this.userModel.findById(userId);
        
        if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
            return false;
        }
        
        const isOTPValid = user.resetPasswordOTP === otp;
        const isOTPExpired = new Date() > user.resetPasswordOTPExpiry;
        
        return isOTPValid && !isOTPExpired;
    }

    async clearResetOTP(userId) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { 
                resetPasswordOTP: null,
                resetPasswordOTPExpiry: null
            }
        );
    }
}

module.exports = AuthRepository; 