"use strict";
//----------------------------------------------------------------
const mongoose = require("mongoose");
const { Schema } = mongoose;

const GroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // Link back to the room this group belongs to
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: false,
      default: null,
    },

    isDissolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "groups",
  }
);

const GroupModel = mongoose.model("groups", GroupSchema);

module.exports = GroupModel;
