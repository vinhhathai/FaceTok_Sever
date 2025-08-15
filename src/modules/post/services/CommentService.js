const { CommentRepository, PostRepository } = require('../repositories');

class CommentService {
	constructor() {
		this.commentRepository = new CommentRepository();
		this.postRepository = new PostRepository();
	}

	// Create a comment for a post
	async createComment(currentUserId, postId, content, parentId = null) {
		// skeleton only
		return this.commentRepository.createComment({
			postId,
			parentId,
			rootId: parentId || null,
			author: currentUserId,
			content
		});
	}

	async getPostComments(postId, options) {
		return this.commentRepository.findCommentsByPostId(postId, options);
	}

	async getCommentReplies(commentId, options) {
		return this.commentRepository.findRepliesByCommentId(commentId, options);
	}
}

module.exports = CommentService;
