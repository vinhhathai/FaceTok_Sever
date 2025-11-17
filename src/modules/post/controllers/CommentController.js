const { CommentService } = require('../services');
const mongoose = require('mongoose');

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

			// Validate ObjectId
			if (!mongoose.Types.ObjectId.isValid(postId)) {
				return res.status(400).json({ success: false, message: 'postId không hợp lệ' });
			}
			if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
				return res.status(400).json({ success: false, message: 'parentId không hợp lệ' });
			}

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

			// Trường hợp client dùng postId tạm thời (temp_*), hệ thống không hỗ trợ
			if (String(postId).startsWith('temp_')) {
				return res.status(400).json({ success: false, message: 'Không hỗ trợ postId tạm thời' });
			}

			// Validate ObjectId để tránh CastError từ Mongoose
			if (!mongoose.Types.ObjectId.isValid(postId)) {
				return res.status(400).json({ success: false, message: 'postId không hợp lệ' });
			}

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

			if (!mongoose.Types.ObjectId.isValid(commentId)) {
				return res.status(400).json({ success: false, message: 'commentId không hợp lệ' });
			}

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

			if (!mongoose.Types.ObjectId.isValid(commentId)) {
				return res.status(400).json({ success: false, message: 'commentId không hợp lệ' });
			}

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

			if (!mongoose.Types.ObjectId.isValid(commentId)) {
				return res.status(400).json({ success: false, message: 'commentId không hợp lệ' });
			}

			// Allow post owner to delete any comment
			const result = await this.commentService.deleteCommentOwned(userId, commentId, true);
			if (!result) {
				return res.status(403).json({ success: false, message: 'Forbidden: cannot delete this comment' });
			}
			return res.status(200).json({ success: true, data: { id: String(commentId), deleted: true } });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};
}

module.exports = CommentController;
