const { LikeModel } = require('../models');

class LikeRepository {
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
        // already liked -> unlike
        await LikeModel.findOneAndDelete({ postId, userId });
        return { action: 'unliked', like: null };
      } else {
        // not liked -> like
        const newLike = new LikeModel({ postId, userId });
        const savedLike = await newLike.save();
        return { action: 'liked', like: savedLike };
      }
    } catch (error) {
      throw new Error(`Failed to toggle like: ${error.message}`);
    }
  }
}

module.exports = LikeRepository;
