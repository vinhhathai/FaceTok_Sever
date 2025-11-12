"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    content: {
      type: String,
      required: function() {
        // Content required if no media
        return !this.media || this.media.length === 0;
      },
    },
    
    // Media attachments (images/videos)
    media: [{
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String, // Cloudinary public ID for deletion
        required: true,
      },
      thumbnail: {
        type: String, // Thumbnail for videos
        default: null,
      },
      width: Number,
      height: Number,
      size: Number, // File size in bytes
      duration: Number, // Video duration in seconds
    }],

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

const MessageModel = mongoose.model("messages", MessageSchema);

module.exports = MessageModel;
