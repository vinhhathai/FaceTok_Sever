const { PostRepository } = require('../repositories');
const {
  uploadBufferToCloudinary,
  processAndUploadImage
} = require('../../../shared/utils/cloudinaryUpload');

class PostService {
  constructor() {
    this.postRepository = new PostRepository();
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
        
        uploadedMedia.push({ type: isVideo ? 'video' : 'image', url: result.secure_url });
      }
    }

    const data = {
      author: currentUserId,
      content: payload?.content || '',
      media: (payload?.media || []).concat(uploadedMedia),
      privacy: payload?.privacy || 'public'
    };
    return this.postRepository.createPost(data);
  }

  // Get single post by id
  async getPostById(postId) {
    return this.postRepository.findPostById(postId);
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
    // TODO: Get friend IDs from friend service/repository
    const friendIds = []; // For now, empty array
    
    return this.postRepository.findTimelinePosts(currentUserId, friendIds, options);
  }

  // Update post
  async updatePost(postId, payload) {
    return this.postRepository.updatePost(postId, payload);
  }

  // Soft delete
  async deletePost(postId) {
    return this.postRepository.deletePost(postId);
  }
}

module.exports = PostService;


