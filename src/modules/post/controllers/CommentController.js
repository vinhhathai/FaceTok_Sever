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
			const userId = req.user.id;
			const { postId } = req.params;
			const { page, limit } = req.query;
			const items = await this.commentService.getPostComments(postId, userId, { page, limit });
			return res.status(200).json({ success: true, data: items });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};

	// GET /comment/:commentId/replies
	replies = async (req, res) => {
		try {
			const userId = req.user.id;
			const { commentId } = req.params;
			const { page, limit } = req.query;
			const items = await this.commentService.getCommentReplies(commentId, userId, { page, limit });
			return res.status(200).json({ success: true, data: items });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};

	// PUT /post/comment/:commentId
	update = async (req, res) => {
		try {
			const userId = req.user.id;
			const { commentId } = req.params;
			const { content } = req.body;
			const updated = await this.commentService.updateCommentOwned(userId, commentId, { content });
			if (!updated) {
				return res.status(403).json({ success: false, message: 'Forbidden: cannot edit this comment' });
			}
			return res.status(200).json({ success: true, data: updated });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};

	// DELETE /post/comment/:commentId
	remove = async (req, res) => {
		try {
			const userId = req.user.id;
			const { commentId } = req.params;
			// Allow post owner to delete any comment
			const result = await this.commentService.deleteCommentOwned(userId, commentId, true);
			if (!result) {
				return res.status(403).json({ success: false, message: 'Forbidden: cannot delete this comment' });
			}
			return res.status(200).json({ success: true, data: { _id: commentId, deleted: true } });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};
}

module.exports = CommentController;
