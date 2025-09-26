const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema({
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

shareSchema.index({ postId: 1, userId: 1 }, { unique: true });
shareSchema.index({ userId: 1, createdAt: -1 });

const ShareModel = mongoose.model("shares", shareSchema);
module.exports = ShareModel;
