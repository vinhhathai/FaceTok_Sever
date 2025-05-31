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
      enum: ["male", "female", ""],
      default: "",
    },
    birthday: { type: Date, default: () => new Date() },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    relationship: {
      type: String,
      enum: ["single", "relationship", "married"],
      default: "",
    },
    lastNameUpdateTime: { type: Date, default: null },
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

  },
  {
    timestamps: true,
    collection: "users",
  }
);

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
