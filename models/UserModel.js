"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String },
    profilePicture: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    role: {
      type: String,
      enum: ["member", "admin", "staff"],
      default: "member",
    },
    isActive: { type: Boolean, default: true },
    notifications: [{ type: mongoose.Types.ObjectId, ref: "notifications" }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "posts" }],
    friends: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    groups: [{ type: mongoose.Types.ObjectId, ref: "groups" }],
    gender: {
      type: String,
      enum: ["male", "female", "No gender"],
      default: "No gender",
    },
    birthday: { type: Date, default: () => new Date() },
    bio: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    location: {type: String, default: "No location"}
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Thêm middleware trước khi lưu để debug
UserSchema.pre('save', function(next) {
  console.log('UserModel pre-save hook called');
  console.log('Document being saved:', this);
  next();
});

// Thêm middleware trước khi findOneAndUpdate để debug
UserSchema.pre('findOneAndUpdate', function(next) {
  console.log('UserModel pre-findOneAndUpdate hook called');
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
  next();
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;