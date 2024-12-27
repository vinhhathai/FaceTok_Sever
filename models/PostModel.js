"use strict";
//----------------------------------------------------------------

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    filePath: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "posts",
  }
);

const PostModel = mongoose.model("posts", PostSchema);

module.exports = PostModel;
