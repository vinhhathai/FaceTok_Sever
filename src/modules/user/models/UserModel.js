"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    thumbnail: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["member", "admin", "staff"],
      default: "member",
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notifications: [{ type: mongoose.Types.ObjectId, ref: "notifications" }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "posts" }],
    friends: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    groups: [{ type: mongoose.Types.ObjectId, ref: "groups" }],
    gender: {
      type: String,
      enum: ["male", "female", "undefined"],
      default: "undefined",
    },
    birthday: { type: Date, default: () => new Date() },
    bio: { type: String },
    location: { type: String, default: "No location" },
    verification: {
      otp: {
        type: String,
        default: null
      },
      otpExpiry: {
        type: Date,
        default: null
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
