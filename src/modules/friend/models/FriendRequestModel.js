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
  const request = await this.findOne({
    sender: senderId,
    recipient: recipientId
  }).lean();
  
  return request;
};

// Add a method to check if a request exists in any direction (used for checking if users have any relationship)
FriendRequestSchema.statics.checkRelationshipExists = async function(userId, targetUserId) {
  const request = await this.findOne({
    $or: [
      { sender: userId, recipient: targetUserId },
      { sender: targetUserId, recipient: userId }
    ]
  }).lean();
  
  return request;
};

// Export the status enum for use in other files
FriendRequestSchema.statics.STATUS = STATUS;

const FriendRequestModel = mongoose.model("friendRequests", FriendRequestSchema);

module.exports = FriendRequestModel; 