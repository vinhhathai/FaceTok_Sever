const { PostModel, CommentModel, LikeModel, ShareModel } = require("../models");

class PostRepository {
  // Create a new post
  async createPost(postData) {
    try {
      const post = new PostModel(postData);
      return await post.save();
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  // Find post by id
  async findPostById(postId) {
    try {
      return await PostModel.findById(postId)
        .populate("author", "fullName profilePicture")
        .lean();
    } catch (error) {
      throw new Error(`Failed to find post: ${error.message}`);
    }
  }

  // Find posts by author with privacy control
  async findPostsByAuthor(authorId, options = {}, privacyOptions = {}) {
    try {
      console.log('🔍 PostRepository.findPostsByAuthor called with:', { authorId, options, privacyOptions });
      
      const { page = 1, limit = 10 } = options;
      const { currentUserId, includePrivate = false } = privacyOptions;
      const skip = (page - 1) * limit;

      // Base query
      let query = {
        author: authorId,
        isDeleted: false,
      };

      // Privacy filter
      if (!includePrivate) {
        query.privacy = { $in: ["public"] };
        // TODO: Add "friends" if currentUserId is friend with authorId
      }
      
      console.log('🔍 Final query:', JSON.stringify(query, null, 2));
      console.log('📊 Pagination:', { page, limit, skip });

      const [posts, total] = await Promise.all([
        PostModel.find(query)
          .populate("author", "fullName profilePicture")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PostModel.countDocuments(query)
      ]);
      
      console.log('✅ Query results:', { postsCount: posts?.length, total });
      console.log('📝 First post sample:', posts?.[0] ? {
        _id: posts[0]._id,
        author: posts[0].author,
        content: posts[0].content?.substring(0, 50) + '...',
        privacy: posts[0].privacy
      } : 'No posts found');

      return { posts, total };
    } catch (error) {
      console.error('❌ PostRepository.findPostsByAuthor error:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to find posts by author: ${error.message}`);
    }
  }

  // Find timeline posts (public + friends)
  async findTimelinePosts(userId, friendIds = [], options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const query = {
        isDeleted: false,
        $or: [
          { privacy: "public" }, // All public posts
          { author: userId }, // User's own posts (all privacy levels)
          {
            privacy: "friends",
            author: { $in: friendIds },
          }, // Friends' posts with friends privacy
        ],
      };

      const [posts, total] = await Promise.all([
        PostModel.find(query)
          .populate("author", "fullName profilePicture")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PostModel.countDocuments(query)
      ]);

      return { posts, total };
    } catch (error) {
      throw new Error(`Failed to find timeline posts: ${error.message}`);
    }
  }

  // Update a post
  async updatePost(postId, updateData) {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  // Update a post ensuring ownership (author must match)
  async updatePostOwnedBy(postId, authorId, updateData) {
    try {
      // If media array provided, set it; otherwise only set allowed fields
      const update = { updatedAt: new Date() };
      if (Object.prototype.hasOwnProperty.call(updateData, 'content')) {
        update.content = updateData.content;
      }
      if (Object.prototype.hasOwnProperty.call(updateData, 'privacy')) {
        update.privacy = updateData.privacy;
      }
      if (Array.isArray(updateData.media)) {
        update.media = updateData.media;
      }

      return await PostModel.findOneAndUpdate(
        { _id: postId, author: authorId, isDeleted: false },
        update,
        { new: true, runValidators: true }
      ).populate("author", "fullName profilePicture").lean();
    } catch (error) {
      throw new Error(`Failed to update owned post: ${error.message}`);
    }
  }

  // Soft delete a post
  async deletePost(postId) {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        { isDeleted: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  // Soft delete a post with ownership check
  async softDeleteOwned(postId, authorId) {
    try {
      const res = await PostModel.updateOne(
        { _id: postId, author: authorId, isDeleted: false },
        { $set: { isDeleted: true, updatedAt: new Date() } }
      );
      return res.modifiedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete owned post: ${error.message}`);
    }
  }

  // Increment like count
  async incrementLikeCount(postId) {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to increment like count: ${error.message}`);
    }
  }

  // Decrement like count
  async decrementLikeCount(postId) {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to decrement like count: ${error.message}`);
    }
  }

  // Increment comment count
  async incrementCommentCount(postId) {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { commentsCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to increment comment count: ${error.message}`);
    }
  }

  // Increment share count
  async incrementShareCount(postId) {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { sharesCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to increment share count: ${error.message}`);
    }
  }

  // Count posts
  async countPosts(query = {}) {
    try {
      return await PostModel.countDocuments({ ...query, isDeleted: false });
    } catch (error) {
      throw new Error(`Failed to count posts: ${error.message}`);
    }
  }
}

module.exports = PostRepository;
