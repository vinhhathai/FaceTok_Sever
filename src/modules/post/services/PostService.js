const { PostRepository } = require('../repositories');
const LikeRepository = require('../repositories/LikeRepository');
const {
  uploadBufferToCloudinary,
  processAndUploadImage,
  deleteFromCloudinary
} = require('../../../shared/utils/cloudinaryUpload');
const FriendRepository = require('../../friend/repositories/FriendRepository');
const moderationService = require('../../../shared/services/ModerationService');
const logger = require('../../../shared/utils/logger');

class PostService {
  constructor() {
    this.postRepository = new PostRepository();
    this.friendRepository = new FriendRepository();
    this.likeRepository = new LikeRepository();
  }

  // Create a new post
  async createPost(currentUserId, payload) {
    // If files uploaded from multipart, transform and upload to Cloudinary
    const uploadedMedia = [];
    if (payload.__files && Array.isArray(payload.__files)) {

      for (const file of payload.__files) {
        const isVideo = file.mimetype.startsWith('video/');
        const folder = isVideo ? 'chaotok/posts/videos' : 'chaotok/posts/images';
        
        let result;
        if (isVideo) {
          // Videos: upload directly (Cloudinary handles compression)
          result = await uploadBufferToCloudinary(file.buffer, {
            folder,
            resource_type: 'video',
            quality: 'auto',
            fetch_format: 'auto'
          });
        } else {
          // Images: resize and compress with Sharp
          result = await processAndUploadImage(
            file.buffer,
            folder,
            {
              width: 1200,
              height: 1200, 
              fit: 'inside',
              quality: 85,
              format: 'jpeg'
            },
            {
              quality: 'auto',
              fetch_format: 'auto'
            }
          );
        }
        
        uploadedMedia.push({
          type: isVideo ? 'video' : 'image',
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    const data = {
      author: currentUserId,
      content: payload?.content || '',
      media: (payload?.media || []).concat(uploadedMedia),
      privacy: payload?.privacy || 'public'
    };

    // ===== CONTENT MODERATION =====
    // Kiểm duyệt nội dung trước khi lưu vào database
    if (moderationService.isEnabled()) {
      const mediaUrls = data.media.map(m => m.url);
      const moderationResult = await moderationService.moderatePost({
        content: data.content,
        mediaUrls,
      });

      logger.info('Post moderation check:', {
        postId: 'new',
        approved: moderationResult.approved,
        violations: moderationResult.violations?.length || 0,
      });

      // Nếu vi phạm nội dung, từ chối tạo post
      if (!moderationResult.approved) {
        // Xóa các media đã upload
        for (const media of uploadedMedia) {
          try {
            await deleteFromCloudinary(media.publicId);
          } catch (cleanupError) {
            logger.error('Failed to cleanup media after moderation rejection:', cleanupError);
          }
        }

        const error = new Error('Nội dung không phù hợp với quy định cộng đồng');
        error.statusCode = 400;
        error.moderationResult = moderationResult;
        throw error;
      }
    }

    return this.postRepository.createPost(data);
  }

  // Get single post by id
  async getPostById(postId, currentUserId = null, userRole = 'user') {
    const post = await this.postRepository.findPostById(postId);
    if (!post) return null;

    // Check if post is deleted - only admin can view deleted posts
    if (post.isDeleted) {
      if (userRole !== 'admin') {
        const err = new Error('Post not found');
        err.statusCode = 404;
        throw err;
      }
      // Admin can view deleted post - add isLiked flag if needed
      if (currentUserId) {
        try {
          const liked = await this.likeRepository.hasUserLikedPost(postId, currentUserId);
          post.isLiked = !!liked;
        } catch (_) {}
      }
      return post;
    }

    // Enforce privacy: public OK; friends only if friend; private only owner
    const privacy = post.privacy || 'public';
    const authorId = post.author?._id?.toString?.() || post.author?._id || post.author?.id || post.author;
    const isOwner = currentUserId && String(authorId) === String(currentUserId);
    if (privacy === 'public' || isOwner) {
      // attach isLiked for detail view
      if (currentUserId) {
        try {
          const liked = await this.likeRepository.hasUserLikedPost(postId, currentUserId);
          post.isLiked = !!liked;
        } catch (_) {}
      }
      return post;
    }

    if (privacy === 'friends') {
      try {
        const friends = await this.friendRepository.getFriendsList(authorId);
        const friendIds = (friends || []).map(f => f && (f._id?.toString?.() || f._id || f.id)).filter(Boolean);
        const isFriend = currentUserId && friendIds.includes(String(currentUserId));
        if (isFriend) {
          if (currentUserId) {
            try {
              const liked = await this.likeRepository.hasUserLikedPost(postId, currentUserId);
              post.isLiked = !!liked;
            } catch (_) {}
          }
          return post;
        }
      } catch (_) {}
    }
    const err = new Error('Forbidden: You do not have permission to view this post');
    err.statusCode = 403;
    throw err;
  }

  // List posts by author with privacy check
  async getPostsByAuthor(authorId, currentUserId, options) {
    try {
      console.log('🔍 PostService.getPostsByAuthor called with:', { authorId, currentUserId, options });
      
      // Privacy logic: 
      // - If viewing own profile, show all non-deleted posts
      // - If viewing other's profile, show public + friends posts (if friends)
      const includePrivate = authorId === currentUserId;
      console.log('🔒 Privacy settings:', { includePrivate });
      
      const result = await this.postRepository.findPostsByAuthor(authorId, options, {
        currentUserId,
        includePrivate
      });
      // Attach isLiked at service layer
      if (Array.isArray(result.posts) && result.posts.length > 0) {
        const postIds = result.posts.map(p => p._id);
        const likedIds = await this.likeRepository.findLikedPostIdsForUser(currentUserId, postIds);
        const likedSet = new Set(likedIds);
        result.posts = result.posts.map(p => ({
          ...p,
          isLiked: likedSet.has(p._id.toString())
        }));
      }
      
      console.log('✅ Repository result:', { postsCount: result.posts?.length, total: result.total });
      return result;
    } catch (error) {
      console.error('❌ PostService.getPostsByAuthor error:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }

  // Timeline for a user (newsfeed)
  async getTimeline(currentUserId, options) {
    // Fetch friend IDs to include friends-only posts in the feed
    let friendIds = [];
    try {
      const friends = await this.friendRepository.getFriendsList(currentUserId);
      if (Array.isArray(friends)) {
        friendIds = friends
          .map((f) => (f && (f._id?.toString?.() || f._id || f.id)))
          .filter(Boolean);
      }
    } catch (e) {
      // Fallback to empty list if friend fetching fails
      friendIds = [];
    }

    const result = await this.postRepository.findTimelinePosts(currentUserId, friendIds, options);
    // Attach isLiked at service layer
    if (Array.isArray(result.posts) && result.posts.length > 0) {
      const postIds = result.posts.map(p => p._id);
      const likedIds = await this.likeRepository.findLikedPostIdsForUser(currentUserId, postIds);
      const likedSet = new Set(likedIds);
      result.posts = result.posts.map(p => ({
        ...p,
        isLiked: likedSet.has(p._id.toString())
      }));
    }
    return result;
  }

  // Update post
  async updatePost(postId, payload, currentUserId) {
    // Allowed top-level fields
    const allowedFields = ["content", "privacy"];
    const updateData = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        updateData[key] = payload[key];
      }
    }

    // Handle media changes:
    // - payload.mediaAdd: files from multer (req.files) mapped to payload.__files
    // - payload.mediaRemove: array of publicId or url to remove

    // Collect existing media updates if provided directly
    if (Array.isArray(payload.media)) {
      updateData.media = payload.media;
    }

    // Upload new files if present (via req.files injected as __files)
    const newUploadedMedia = [];
    if (payload.__files && Array.isArray(payload.__files)) {
      for (const file of payload.__files) {
        const isVideo = file.mimetype.startsWith('video/');
        const folder = isVideo ? 'chaotok/posts/videos' : 'chaotok/posts/images';
        let result;
        if (isVideo) {
          result = await uploadBufferToCloudinary(file.buffer, {
            folder,
            resource_type: 'video',
            quality: 'auto',
            fetch_format: 'auto'
          });
        } else {
          result = await processAndUploadImage(
            file.buffer,
            folder,
            {
              width: 1200,
              height: 1200,
              fit: 'inside',
              quality: 85,
              format: 'jpeg'
            },
            {
              quality: 'auto',
              fetch_format: 'auto'
            }
          );
        }
        newUploadedMedia.push({
          type: isVideo ? 'video' : 'image',
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    // Determine final media set and deletions
    let finalMediaArray = null;
    let mediaToDelete = [];

    // Fetch existing post to compare media
    const existing = await this.postRepository.findPostById(postId);

    if (Array.isArray(updateData.media)) {
      // Full replacement mode: use provided media array as baseline
      finalMediaArray = Array.isArray(updateData.media) ? [...updateData.media] : [];
      // Compute deletions: items present in existing but not in final
      const existingKeys = (existing?.media || []).map(m => m.publicId || m.url);
      const finalKeys = finalMediaArray.map(m => m.publicId || m.url);
      mediaToDelete = (existing?.media || []).filter(m => !finalKeys.includes(m.publicId || m.url));
    } else {
      // Incremental mode: start from existing, remove items listed in mediaRemove, then append new uploads
      const existingMedia = Array.isArray(existing?.media) ? [...existing.media] : [];
      const mediaRemove = Array.isArray(payload.mediaRemove) ? payload.mediaRemove : [];
      const removeKeys = new Set(mediaRemove);
      mediaToDelete = existingMedia.filter(m => removeKeys.has(m.publicId || m.url));
      finalMediaArray = existingMedia.filter(m => !removeKeys.has(m.publicId || m.url));
    }

    // Append newly uploaded media
    if (newUploadedMedia.length > 0) {
      finalMediaArray = [...(finalMediaArray || []), ...newUploadedMedia];
    }

    // Assign computed media to update
    updateData.media = finalMediaArray || [];

    // Enforce ownership by requiring author = currentUserId
    const updated = await this.postRepository.updatePostOwnedBy(postId, currentUserId, updateData);

    // Fire-and-forget deletion on Cloudinary for removed items (if any)
    if (mediaToDelete.length > 0) {
      for (const m of mediaToDelete) {
        if (m.publicId) {
          const resourceType = m.type === 'video' ? 'video' : 'image';
          deleteFromCloudinary(m.publicId, resourceType).catch(() => {});
        }
      }
    }

    return updated;
  }

  // Soft delete
  async deletePost(postId) {
    return this.postRepository.deletePost(postId);
  }

  // Soft delete with ownership check
  async deletePostOwned(postId, currentUserId) {
    return this.postRepository.softDeleteOwned(postId, currentUserId);
  }
}

module.exports = PostService;


