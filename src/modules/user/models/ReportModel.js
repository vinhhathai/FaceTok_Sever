"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    reportType: {
      type: String,
      enum: ["bug", "post", "user", "other"],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
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
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "rejected"],
      default: "pending"
    },
    reportedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true
    },
    resolvedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    adminNote: {
      type: String,
      maxlength: 500,
      default: ""
    },
    // Optional: Link to related entities
    relatedPostId: {
      type: String,
      default: null
    },
    relatedUserId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "reports",
  }
);

// Index for better query performance
ReportSchema.index({ reportedBy: 1, createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reportType: 1 });

const ReportModel = mongoose.model("reports", ReportSchema);

module.exports = ReportModel;
