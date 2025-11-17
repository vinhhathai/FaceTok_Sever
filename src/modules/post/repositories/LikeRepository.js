const { LikeModel } = require('../models');
const UserModel = require('../../user/models/UserModel');

class LikeRepository {
  constructor() {
    this.userModel = UserModel;
  }
  // Create a new like
  async createLike(likeData) {
    try {
      const like = new LikeModel(likeData);
      return await like.save();
    } catch (error) {
      throw new Error(`Failed to create like: ${error.message}`);
    }
  }

  // Find like by postId and userId
  async findLikeByPostAndUser(postId, userId) {
    try {
      return await LikeModel.findOne({ postId, userId }).lean();
    } catch (error) {
      throw new Error(`Failed to find like: ${error.message}`);
    }
  }

  // Find all likes of a post
  async findLikesByPostId(postId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      return await LikeModel.find({ postId })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find likes by post: ${error.message}`);
    }
  }

  // Find all posts liked by a user
  async findLikedPostsByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      return await LikeModel.find({ userId })
        .populate('postId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find liked posts: ${error.message}`);
    }
  }

  // Delete a like
  async deleteLike(postId, userId) {
    try {
      return await LikeModel.findOneAndDelete({ postId, userId });
    } catch (error) {
      throw new Error(`Failed to delete like: ${error.message}`);
    }
  }

  // Check whether user already liked the post
  async hasUserLikedPost(postId, userId) {
    try {
      const like = await LikeModel.findOne({ postId, userId });
      return !!like;
    } catch (error) {
      throw new Error(`Failed to check like: ${error.message}`);
    }
  }

  // Count likes of a post
  async countLikesByPostId(postId) {
    try {
      return await LikeModel.countDocuments({ postId });
    } catch (error) {
      throw new Error(`Failed to count likes: ${error.message}`);
    }
  }

  // Count total posts liked by a user
  async countLikedPostsByUser(userId) {
    try {
      return await LikeModel.countDocuments({ userId });
    } catch (error) {
      throw new Error(`Failed to count liked posts: ${error.message}`);
    }
  }

  // Toggle like (if liked then unlike, otherwise like)
  async toggleLike(postId, userId) {
    try {
      const existingLike = await LikeModel.findOne({ postId, userId });
      if (existingLike) {
        await LikeModel.findOneAndDelete({ postId, userId });
        return { action: 'unliked', like: null };
      }
      try {
        const newLike = new LikeModel({ postId, userId });
        const savedLike = await newLike.save();
        return { action: 'liked', like: savedLike };
      } catch (err) {
        if (String(err?.message || '').includes('E11000')) {
          // Another like already exists (race condition) → treat as liked
          return { action: 'liked', like: null };
        }
        throw err;
      }
    } catch (error) {
      throw new Error(`Failed to toggle like: ${error.message}`);
    }
  }

  // Get list of postIds liked by a user among a set of postIds
  async findLikedPostIdsForUser(userId, postIds) {
    try {
      if (!userId || !Array.isArray(postIds) || postIds.length === 0) return [];
      const likedIds = await LikeModel.find({ postId: { $in: postIds }, userId }).distinct('postId');
      return likedIds.map((id) => id.toString());
    } catch (error) {
      throw new Error(`Failed to fetch liked post ids: ${error.message}`);
    }
  }

  // ========== COMMENT LIKE METHODS ==========

  // Find like by commentId and userId
  async findLikeByCommentAndUser(commentId, userId) {
    try {
      return await LikeModel.findOne({ commentId, userId }).lean();
    } catch (error) {
      throw new Error(`Failed to find comment like: ${error.message}`);
    }
  }

  // Check whether user already liked the comment
  async hasUserLikedComment(commentId, userId) {
    try {
      const like = await LikeModel.findOne({ commentId, userId });
      return !!like;
    } catch (error) {
      throw new Error(`Failed to check comment like: ${error.message}`);
    }
  }

  // Count likes of a comment
  async countLikesByCommentId(commentId) {
    try {
      return await LikeModel.countDocuments({ commentId });
    } catch (error) {
      throw new Error(`Failed to count comment likes: ${error.message}`);
    }
  }

  // Toggle comment like
  async toggleCommentLike(commentId, userId) {
    try {
      const existingLike = await LikeModel.findOne({ commentId, userId });
      
      if (existingLike) {
        // already liked -> unlike
        await LikeModel.findOneAndDelete({ commentId, userId });
        return { action: 'unliked', like: null };
      } else {
        // not liked -> like
        try {
          const newLike = new LikeModel({ commentId, userId });
          const savedLike = await newLike.save();
          return { action: 'liked', like: savedLike };
        } catch (err) {
          // Handle duplicate key race condition gracefully
          if (String(err?.message || '').includes('E11000')) {
            return { action: 'liked', like: null };
          }
          throw err;
        }
      }
    } catch (error) {
      throw new Error(`Failed to toggle comment like: ${error.message}`);
    }
  }

  // Get list of commentIds liked by a user among a set of commentIds
  async findLikedCommentIdsForUser(userId, commentIds) {
    try {
      if (!userId || !Array.isArray(commentIds) || commentIds.length === 0) return [];
      const likedIds = await LikeModel.find({ commentId: { $in: commentIds }, userId }).distinct('commentId');
      return likedIds.map((id) => id.toString());
    } catch (error) {
      throw new Error(`Failed to fetch liked comment ids: ${error.message}`);
    }
  }
}

module.exports = LikeRepository;
