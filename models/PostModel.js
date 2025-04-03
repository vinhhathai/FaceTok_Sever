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
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    isDelete: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: "posts",
  }
);

// Tạo virtual property để trả về đường dẫn đầy đủ đến file
PostSchema.virtual('mediaUrl').get(function() {
  return this.filePath ? this.filePath : '';
});

// Tạo method để thêm like
PostSchema.methods.like = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
  }
};

// Tạo method để bỏ like
PostSchema.methods.unlike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
  this.likesCount = this.likes.length;
};

// Tạo method để thêm comment
PostSchema.methods.addComment = function(userId, text) {
  this.comments.push({ userId, text });
  this.commentsCount = this.comments.length;
};

// Đảm bảo Mongoose biết khi trả về JSON, hãy bao gồm cả virtual properties
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

const PostModel = mongoose.model("posts", PostSchema);

module.exports = PostModel;
