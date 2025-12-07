const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "posts"
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comments"
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
}, { timestamps: true });

// Ensure a user can like a post only once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true, partialFilterExpression: { postId: { $type: 'objectId' } } });
// Ensure a user can like a comment only once
likeSchema.index({ commentId: 1, userId: 1 }, { unique: true, partialFilterExpression: { commentId: { $type: 'objectId' } } });
likeSchema.index({ userId: 1, createdAt: -1 });

// Validation: Either postId or commentId must be present
likeSchema.pre('validate', function(next) {
  if (!this.postId && !this.commentId) {
    next(new Error('Either postId or commentId must be provided'));
  } else if (this.postId && this.commentId) {
    next(new Error('Cannot like both post and comment at the same time'));
  } else {
    next();
  }
});

const LikeModel = mongoose.model("likes", likeSchema);
module.exports = LikeModel;
