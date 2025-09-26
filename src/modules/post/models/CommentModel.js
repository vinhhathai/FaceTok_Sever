const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "posts", required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "comments", default: null },
  rootId: { type: mongoose.Schema.Types.ObjectId, ref: "comments", default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  content: { type: String, maxlength: 1000, trim: true, required: true },
  likesCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

commentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });

const CommentModel = mongoose.model("comments", commentSchema);
module.exports = CommentModel;
