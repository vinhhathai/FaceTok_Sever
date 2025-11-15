const { LikeService } = require('../services');

class LikeController {
	constructor() {
		this.likeService = new LikeService();
	}

	// POST /post/:postId/like/toggle
	toggle = async (req, res) => {
		try {
			const userId = req.user.id;
			const { postId } = req.params;
			
			// Skip temporary/optimistic post IDs from frontend
			if (postId.startsWith('temp_')) {
				return res.status(400).json({ 
					success: false, 
					message: 'Cannot like temporary post. Wait for post creation to complete.' 
				});
			}
			
			const result = await this.likeService.toggleLike(userId, postId);
			return res.status(200).json({ success: true, data: result });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};

	// POST /post/comment/:commentId/like/toggle
	toggleCommentLike = async (req, res) => {
		try {
			const userId = req.user.id;
			const { commentId } = req.params;
			const result = await this.likeService.toggleCommentLike(userId, commentId);
			return res.status(200).json({ success: true, data: result });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};
}

module.exports = LikeController;
