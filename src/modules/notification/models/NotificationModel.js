"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users" 
    },
    content: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["friend_request", "friend_accept", "post_like", "post_comment", "system"], 
      required: true 
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel"
    },
    onModel: {
      type: String,
      enum: ["users", "posts", "comments"]
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

const NotificationModel = mongoose.model("notifications", NotificationSchema);

module.exports = NotificationModel; 