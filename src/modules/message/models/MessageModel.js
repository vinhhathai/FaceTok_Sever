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
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

const MessageModel = mongoose.model("messages", MessageSchema);

module.exports = MessageModel;
