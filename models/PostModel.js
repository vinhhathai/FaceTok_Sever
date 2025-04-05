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
    },
    
   
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

// Tạo virtual field để lấy comments theo postId
PostSchema.virtual('comments', {
  ref: 'comments',
  localField: '_id',
  foreignField: 'postId',
  options: { sort: { createdAt: -1 } }
});

// Đảm bảo Mongoose biết khi trả về JSON, hãy bao gồm cả virtual properties
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

const PostModel = mongoose.model("posts", PostSchema);

module.exports = PostModel;
