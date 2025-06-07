"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoomSchema = new Schema(
  {
    members: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users" 
    }],
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages"
    }],
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      default: null
    },
    groupAvatar: {
      type: String,
      default: null
    } 
  },
  {
    timestamps: true,
    collection: "rooms",
  }
);

// Index to make querying conversations by participants faster
RoomSchema.index({ participants: 1 });

const RoomModel = mongoose.model("rooms", RoomSchema);

module.exports = RoomModel; 