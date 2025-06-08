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

    isGroup: {
      type: Boolean,
      default: false,
    },
    
    // Lưu tin nhắn cuối cùng để hiển thị trong danh sách chat
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      default: null
    }
  },
  {
    timestamps: true,
    collection: "rooms",
  }
);

// Index to make querying conversations by participants faster
RoomSchema.index({ members: 1 });

const RoomModel = mongoose.model("rooms", RoomSchema);

module.exports = RoomModel;
