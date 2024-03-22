const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    fullName: { type: String },
    notifications: [{ type: mongoose.Types.ObjectId, ref: 'notifications' }],
    posts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    friends: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    groups: [{ type: mongoose.Types.ObjectId, ref: 'groups' }],
    gender: { type: String, enum: ['male', 'female'] },
    birthday: { type: Date },
    bio: { type: String }
});

const UserModel = mongoose.model('users', UserSchema, 'users');

module.exports = UserModel;
