"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    imagePublicId: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info"
    },
    targetAudience: {
      type: String,
      enum: ["all", "member", "staff"],
      default: "all"
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startsAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
  },
  {
    timestamps: true,
    collection: "announcements",
  }
);

// Index for better query performance
AnnouncementSchema.index({ isActive: 1, createdAt: -1 });
AnnouncementSchema.index({ targetAudience: 1 });

const AnnouncementModel = mongoose.model("announcements", AnnouncementSchema);

module.exports = AnnouncementModel;
