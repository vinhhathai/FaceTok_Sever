"use strict";
//----------------------------------------------------------------

const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: "comments",
  }
);

// Tạo index để tăng tốc hiệu suất truy vấn
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

// Đảm bảo các virtual fields được bao gồm khi chuyển đổi thành JSON
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

const CommentModel = mongoose.model("comments", CommentSchema);

module.exports = CommentModel; 