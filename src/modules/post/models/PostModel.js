// post.model.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  content: { type: String, maxlength: 5000, trim: true, default: "" },
  media: [{
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    publicId: { type: String } // optional, used for deletion on Cloudinary
  }],
  likesCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  privacy: { type: String, enum: ["public", "friends", "private"], default: "public" },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ privacy: 1, createdAt: -1 });

const PostModel = mongoose.model("posts", postSchema);
module.exports = PostModel;
