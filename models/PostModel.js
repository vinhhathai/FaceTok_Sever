"use strict";
//----------------------------------------------------------------

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
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
  },
  {
    timestamps: true,
    collection: "posts",
  }
);

const PostModel = mongoose.model("posts", PostSchema);

module.exports = PostModel;
