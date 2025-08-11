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
