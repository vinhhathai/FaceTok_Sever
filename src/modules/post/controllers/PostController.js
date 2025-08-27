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
      const currentUserId = req.user?.id || null;
      const result = await this.postService.getPostById(req.params.id, currentUserId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      const status = error.statusCode || (error.message?.includes('Forbidden') ? 403 : 500);
      return res.status(status).json({ success: false, message: error.message });
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
      const currentUserId = req.user.id;
      // Attach uploaded files and normalize mediaRemove
      const files = Array.isArray(req.files) ? req.files : [];
      const body = { ...req.body, __files: files };

      // Normalize mediaRemove: accept JSON string or repeated fields
      if (typeof body.mediaRemove === 'string') {
        try {
          body.mediaRemove = JSON.parse(body.mediaRemove);
        } catch (_) {
          body.mediaRemove = [body.mediaRemove];
        }
      }
      if (Array.isArray(body['mediaRemove[]'])) {
        body.mediaRemove = body['mediaRemove[]'];
        delete body['mediaRemove[]'];
      }

      const updated = await this.postService.updatePost(
        req.params.id,
        body,
        currentUserId
      );

      if (!updated) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only edit your own posts"
        });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // DELETE /post/:id
  remove = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const deleted = await this.postService.deletePostOwned(req.params.id, currentUserId);
      if (!deleted) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own posts' });
      }
      return res.status(200).json({ success: true, data: { _id: req.params.id, deleted: true } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = PostController;
