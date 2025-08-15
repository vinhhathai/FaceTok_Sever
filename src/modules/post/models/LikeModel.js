const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "posts", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
}, { timestamps: true });

// Ensure a user can like a post only once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });
likeSchema.index({ userId: 1, createdAt: -1 });

const LikeModel = mongoose.model("likes", likeSchema);
module.exports = LikeModel;
