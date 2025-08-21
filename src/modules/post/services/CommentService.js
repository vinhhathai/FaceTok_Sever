const { CommentRepository, PostRepository } = require('../repositories');

class CommentService {
	constructor() {
		this.commentRepository = new CommentRepository();
		this.postRepository = new PostRepository();
	}

	// Create a comment for a post
	async createComment(currentUserId, postId, content, parentId = null) {
		// Tạo comment
		const saved = await this.commentRepository.createComment({
			postId,
			parentId,
			rootId: parentId || null,
			author: currentUserId,
			content
		});
		// Tăng đếm comment cho post gốc
		await this.postRepository.incrementCommentCount(postId);
		// Nếu là reply, tăng replyCount cho comment cha
		if (parentId) {
			await this.commentRepository.incrementReplyCount(parentId);
		}
		// Trả về comment đã populate tác giả
		return this.commentRepository.findCommentById(saved._id);
	}

	async getPostComments(postId, options) {
		return this.commentRepository.findCommentsByPostId(postId, options);
	}

	async getCommentReplies(commentId, options) {
		return this.commentRepository.findRepliesByCommentId(commentId, options);
	}

	// Delete comment owned by user or by post owner
	async deleteCommentOwned(currentUserId, commentId, allowPostOwner = false) {
		// Fetch comment to verify ownership
		const existing = await this.commentRepository.findCommentById(commentId);
		if (!existing) return false;
		// If allowPostOwner, fetch post to check owner
		if (allowPostOwner) {
			const post = await this.postRepository.findPostById(existing.postId);
			const isPostOwner = String(post?.author?._id || post?.author) === String(currentUserId);
			const isCommentOwner = String(existing.author?._id || existing.author) === String(currentUserId);
			if (!isPostOwner && !isCommentOwner) return false;
		} else if (String(existing.author?._id || existing.author) !== String(currentUserId)) {
			return false;
		}
		await this.commentRepository.deleteComment(commentId);
		// Decrement counters
		if (existing.parentId) {
			await this.commentRepository.decrementReplyCount(existing.parentId);
		} else if (existing.postId) {
			await this.postRepository.decrementCommentCount(existing.postId);
		}
		return true;
	}
}

module.exports = CommentService;
