const { ShareModel } = require('../models');

class ShareRepository {
  // Create a new share
  async createShare(shareData) {
    try {
      const share = new ShareModel(shareData);
      return await share.save();
    } catch (error) {
      throw new Error(`Failed to create share: ${error.message}`);
    }
  }

  // Find share by postId and userId
  async findShareByPostAndUser(postId, userId) {
    try {
      return await ShareModel.findOne({ postId, userId }).lean();
    } catch (error) {
      throw new Error(`Failed to find share: ${error.message}`);
    }
  }

  // Find all shares of a post
  async findSharesByPostId(postId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      return await ShareModel.find({ postId })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find shares by post: ${error.message}`);
    }
  }

  // Find all posts shared by a user
  async findSharedPostsByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      return await ShareModel.find({ userId })
        .populate('postId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to find shared posts: ${error.message}`);
    }
  }

  // Delete a share
  async deleteShare(postId, userId) {
    try {
      return await ShareModel.findOneAndDelete({ postId, userId });
    } catch (error) {
      throw new Error(`Failed to delete share: ${error.message}`);
    }
  }

  // Check whether user already shared the post
  async hasUserSharedPost(postId, userId) {
    try {
      const share = await ShareModel.findOne({ postId, userId });
      return !!share;
    } catch (error) {
      throw new Error(`Failed to check share: ${error.message}`);
    }
  }

  // Count shares of a post
  async countSharesByPostId(postId) {
    try {
      return await ShareModel.countDocuments({ postId });
    } catch (error) {
      throw new Error(`Failed to count shares: ${error.message}`);
    }
  }

  // Count total posts shared by a user
  async countSharedPostsByUser(userId) {
    try {
      return await ShareModel.countDocuments({ userId });
    } catch (error) {
      throw new Error(`Failed to count shared posts: ${error.message}`);
    }
  }

  // Toggle share (if shared then unshare, otherwise share)
  async toggleShare(postId, userId) {
    try {
      const existingShare = await ShareModel.findOne({ postId, userId });
      
      if (existingShare) {
        // already shared -> idempotent (do nothing)
        return { action: 'exists', share: existingShare };
      } else {
        // not shared -> share
        const newShare = new ShareModel({ postId, userId });
        const savedShare = await newShare.save();
        return { action: 'shared', share: savedShare };
      }
    } catch (error) {
      throw new Error(`Failed to toggle share: ${error.message}`);
    }
  }

  // Get list of users who shared a post
  async getUsersWhoSharedPost(postId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      return await ShareModel.find({ postId })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw new Error(`Failed to get users who shared: ${error.message}`);
    }
  }
}

module.exports = ShareRepository;
