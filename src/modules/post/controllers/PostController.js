const { PostService } = require("../services");
const { createPostValidation } = require("../validations");

class PostController {
  constructor() {
    this.postService = new PostService();
  }

  // POST /post
  create = async (req, res) => {
    try {
      const userId = req.user.id;
      // Pull files from multer (if any) and attach to payload for service
      const files = Array.isArray(req.files) ? req.files : [];
      const { error, value } = createPostValidation.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details?.[0]?.message || "Invalid request" });
      }
      const post = await this.postService.createPost(userId, { ...value, __files: files });
      return res.status(201).json({ success: true, data: post });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // GET /post/:id
  getById = async (req, res) => {
    try {
      const post = await this.postService.getPostById(req.params.id);
      return res.status(200).json({ success: true, data: post });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // GET /post/author/:authorId
  getByAuthor = async (req, res) => {
    try {
      const { authorId } = req.params;
      const currentUserId = req.user.id;
      
      console.log('🔍 PostController.getByAuthor called with:', { authorId, currentUserId });
      
      // Query parameters for pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const options = { page, limit };
      console.log('📊 Options:', options);
      
      const result = await this.postService.getPostsByAuthor(authorId, currentUserId, options);
      console.log('✅ Service result:', { postsCount: result.posts?.length, total: result.total });
      
      return res.status(200).json({ 
        success: true, 
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error('❌ PostController.getByAuthor error:', error);
      console.error('❌ Error stack:', error.stack);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // GET /post/timeline
  getTimeline = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      
      // Query parameters for pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const options = { page, limit };
      const result = await this.postService.getTimeline(currentUserId, options);
      
      return res.status(200).json({ 
        success: true, 
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // PUT /post/:id
  update = async (req, res) => {
    try {
      const updated = await this.postService.updatePost(
        req.params.id,
        req.body
      );
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // DELETE /post/:id
  remove = async (req, res) => {
    try {
      const deleted = await this.postService.deletePost(req.params.id);
      return res.status(200).json({ success: true, data: deleted });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = PostController;
