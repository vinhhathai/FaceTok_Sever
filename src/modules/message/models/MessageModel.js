"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    receiverId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    read: {
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
    collection: "messages",
  }
);

// Function to get unique conversation ID between two users
MessageSchema.statics.getConversationId = function(userId1, userId2) {
  // Sort user IDs alphabetically to ensure consistent conversation IDs
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Method to mark message as read
MessageSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

const MessageModel = mongoose.model("messages", MessageSchema);

module.exports = MessageModel; 