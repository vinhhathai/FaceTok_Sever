"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define statuses for friend requests
const STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected"
};

const FriendRequestSchema = new Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    recipient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.ACCEPTED, STATUS.REJECTED],
      default: STATUS.PENDING
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "friendRequests",
  }
);

// Ensure we don't have duplicate friend requests between the same users
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

// Static method to check if a friend request exists
FriendRequestSchema.statics.checkExists = async function(senderId, recipientId) {
  return await this.findOne({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId }
    ]
  });
};

// Export the status enum for use in other files
FriendRequestSchema.statics.STATUS = STATUS;

const FriendRequestModel = mongoose.model("friendRequests", FriendRequestSchema);

module.exports = FriendRequestModel; 