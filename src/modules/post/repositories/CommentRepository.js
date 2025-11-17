const { CommentModel } = require("../models");
const UserModel = require('../../user/models/UserModel');

class CommentRepository {
  constructor() {
    this.userModel = UserModel;
  }
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
        .populate("author", "fullName profilePicture")
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

      // 1) Fetch root comments (parentId = null)
      const roots = await CommentModel.find({
        postId,
        parentId: null,
        isDeleted: false,
      })
        .populate('author', 'fullName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      if (roots.length === 0) return roots;

      // 2) Fetch replies for these roots and group by parentId
      const rootIds = roots.map((c) => c._id);
      const replies = await CommentModel.find({
        parentId: { $in: rootIds },
        isDeleted: false,
      })
        .populate('author', 'fullName profilePicture')
        .sort({ createdAt: 1 })
        .lean();

      const parentIdToReplies = new Map();
      for (const r of replies) {
        const key = r.parentId?.toString?.() || String(r.parentId);
        if (!parentIdToReplies.has(key)) parentIdToReplies.set(key, []);
        parentIdToReplies.get(key).push(r);
      }

      // 3) Attach replies array to each root
      const withReplies = roots.map((c) => ({
        ...c,
        replies: parentIdToReplies.get(c._id.toString()) || [],
      }));

      return withReplies;
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
        .populate("author", "fullName profilePicture")
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
        .populate("author", "fullName profilePicture")
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
      ).lean();
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

  // Set like count to an exact value (ensures updatedAt changes)
  async setLikeCount(commentId, count) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { $set: { likesCount: count, updatedAt: new Date() } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to set like count: ${error.message}`);
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

  // Decrement reply count
  async decrementReplyCount(commentId) {
    try {
      return await CommentModel.findByIdAndUpdate(
        commentId,
        { $inc: { replyCount: -1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to decrement reply count: ${error.message}`);
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

  // Soft delete all replies under a parent comment
  async deleteRepliesByParentId(parentId) {
    try {
      return await CommentModel.updateMany(
        { parentId, isDeleted: false },
        { $set: { isDeleted: true, updatedAt: new Date() } }
      );
    } catch (error) {
      throw new Error(`Failed to delete replies by parentId: ${error.message}`);
    }
  }
}

module.exports = CommentRepository;
