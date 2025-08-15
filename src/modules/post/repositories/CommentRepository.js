const { CommentModel } = require("../models");

class CommentRepository {
  // Create a new comment
  async createComment(commentData) {
    try {
      const comment = new CommentModel(commentData);
      return await comment.save();
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  // Find comment by id
  async findCommentById(commentId) {
    try {
      return await CommentModel.findById(commentId)
        .populate("author", "name avatar")
        .lean();
    } catch (error) {
      throw new Error(`Failed to find comment: ${error.message}`);
    }
  }

  // Find all root comments of a post
  async findCommentsByPostId(postId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      return await CommentModel.find({
        postId,
        parentId: null, // only root comments
        isDeleted: false,
      })
        .populate("author", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find comments by post: ${error.message}`);
    }
  }

  // Find replies of a comment
  async findRepliesByCommentId(commentId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      return await CommentModel.find({
        parentId: commentId,
        isDeleted: false,
      })
        .populate("author", "name avatar")
        .sort({ createdAt: 1 }) // chronological order
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find replies: ${error.message}`);
    }
  }

  // Find comments by author
  async findCommentsByAuthor(authorId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      return await CommentModel.find({
        author: authorId,
        isDeleted: false,
      })
        .populate("author", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find comments by author: ${error.message}`);
    }
  }

  // Update a comment
  async updateComment(commentId, updateData) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }
  }

  // Soft delete a comment
  async deleteComment(commentId) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { isDeleted: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  // Increment like count
  async incrementLikeCount(commentId) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { $inc: { likesCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to increment like count: ${error.message}`);
    }
  }

  // Decrement like count
  async decrementLikeCount(commentId) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to decrement like count: ${error.message}`);
    }
  }

  // Increment reply count
  async incrementReplyCount(commentId) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { $inc: { replyCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to increment reply count: ${error.message}`);
    }
  }

  // Count comments by post
  async countCommentsByPostId(postId) {
    try {
      return await CommentModel.countDocuments({
        postId,
        isDeleted: false,
      });
    } catch (error) {
      throw new Error(`Failed to count comments: ${error.message}`);
    }
  }

  // Count replies by comment
  async countRepliesByCommentId(commentId) {
    try {
      return await CommentModel.countDocuments({
        parentId: commentId,
        isDeleted: false,
      });
    } catch (error) {
      throw new Error(`Failed to count replies: ${error.message}`);
    }
  }
}

module.exports = CommentRepository;
