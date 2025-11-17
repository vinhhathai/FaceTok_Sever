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
    profilePicturePublicId: {
      type: String,
      default: ""
    },
    thumbnail: {
      type: String,
      default: ""
    },
    thumbnailPublicId: {
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
      default: false  // Changed: User inactive until email verified
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOTP: {
      type: String,
      default: null
    },
    emailVerificationExpiry: {
      type: Date,
      default: null
    },
    notifications: [{ type: mongoose.Types.ObjectId, ref: "notifications" }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "posts" }],
    friends: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    groups: [{ type: mongoose.Types.ObjectId, ref: "groups" }],
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    birthday: { type: Date, default: () => new Date() },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    relationship: {
      type: String,
      enum: ["single", "relationship", "married", ""],
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
    blockedUsers: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    
    // Refresh Token
    refreshToken: {
      type: String,
      default: null
    },
    refreshTokenExpiry: {
      type: Date,
      default: null
    },
    
    // Terms & Privacy Acceptance
    termsAcceptance: {
      accepted: {
        type: Boolean,
        default: false,
        required: true
      },
      acceptedAt: {
        type: Date,
        default: null
      },
      version: {
        type: String,
        default: null  // Version of terms accepted (e.g., "1.0")
      },
      ipAddress: {
        type: String,
        default: null  // IP address when accepted
      }
    },
    
    // Privacy Settings - Control visibility of ALL personal info fields
    showPersonalInfo: {
      type: Boolean,
      default: true  // true = show all info, false = hide all info
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);



const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
