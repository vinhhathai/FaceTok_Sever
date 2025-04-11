"use strict";
//----------------------------------------------------------------
const CommentModel = require('../models/CommentModel');
const PostModel = require('../models/PostModel');

class CommentRepository {
    constructor() {
        this.model = CommentModel;
        this.postModel = PostModel;
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async findByPostId(postId, options = { skip: 0, limit: 20 }) {
        return this.model.find({ postId })
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit)
            .populate('userId', 'fullName profilePicture');
    }

    async create(commentData) {
        // Tạo comment mới
        const newComment = await this.model.create(commentData);
        
        // Cập nhật commentsCount trong post
        if (newComment) {
            await this.postModel.findByIdAndUpdate(
                commentData.postId,
                { $inc: { commentsCount: 1 } }
            );
        }
        
        return newComment;
    }

    async update(commentId, text) {
        return this.model.findByIdAndUpdate(
            commentId,
            { $set: { text } },
            { new: true }
        );
    }

    async delete(commentId) {
        const comment = await this.model.findById(commentId);
        if (!comment) return null;
        
        // Giảm commentsCount trong post
        await this.postModel.findByIdAndUpdate(
            comment.postId,
            { $inc: { commentsCount: -1 } }
        );
        
        // Xóa comment
        return this.model.findByIdAndDelete(commentId);
    }

    async countByPostId(postId) {
        return this.model.countDocuments({ postId });
    }
}

module.exports = CommentRepository; 