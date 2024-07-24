'use strict';
//----------------------------------------------------------------
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    role: { type: String, enum: ['member', 'admin', 'staff'], default: "member" },
    isActive: { type: Boolean, default: true },
    fullName: { type: String },
    notifications: [{ type: mongoose.Types.ObjectId, ref: 'notifications' }],
    posts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    friends: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    groups: [{ type: mongoose.Types.ObjectId, ref: 'groups' }],
    gender: { type: String, enum: ['male', 'female', 'undefined'], default: "undefined" },
    birthday: { type: Date },
    bio: { type: String }
}, {
    timestamps: true,
    collection: 'users'
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
