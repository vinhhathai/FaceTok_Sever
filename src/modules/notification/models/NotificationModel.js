"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'friend_request',
      'friend_accept',
      'message',
      'group_invite',
      'post_like',
      'post_comment',
      'mention',
      'system'
    ],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const NotificationModel = mongoose.model("notifications", NotificationSchema);

module.exports = NotificationModel; 