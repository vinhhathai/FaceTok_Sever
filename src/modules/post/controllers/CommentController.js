const { CommentService } = require('../services');

class CommentController {
	constructor() {
		this.commentService = new CommentService();
	}

	// POST /post/:postId/comment
	create = async (req, res) => {
		try {
			const userId = req.user.id;
			const { postId } = req.params;
			const { content, parentId } = req.body;
			const comment = await this.commentService.createComment(userId, postId, content, parentId || null);
			return res.status(201).json({ success: true, data: comment });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};

	// GET /post/:postId/comments
	listByPost = async (req, res) => {
		try {
			const { postId } = req.params;
			const { page, limit } = req.query;
			const items = await this.commentService.getPostComments(postId, { page, limit });
			return res.status(200).json({ success: true, data: items });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};

	// GET /comment/:commentId/replies
	replies = async (req, res) => {
		try {
			const { commentId } = req.params;
			const { page, limit } = req.query;
			const items = await this.commentService.getCommentReplies(commentId, { page, limit });
			return res.status(200).json({ success: true, data: items });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};
}

module.exports = CommentController;
