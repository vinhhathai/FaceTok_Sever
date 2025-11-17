const { CommentRepository, PostRepository, LikeRepository } = require('../repositories');
const NotificationService = require('../../notification/services/NotificationService');

class CommentService {
	constructor() {
		this.commentRepository = new CommentRepository();
		this.postRepository = new PostRepository();
		this.likeRepository = new LikeRepository();
		this.notificationService = new NotificationService();
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
		
		// Gửi notification cho tác giả bài viết (nếu không phải chính mình)
		const post = await this.postRepository.findPostById(postId);
		if (post && post.author._id.toString() !== currentUserId) {
			const commenter = await this.commentRepository.userModel.findById(currentUserId);
			
			await this.notificationService.createAndSend({
				user: post.author,
				type: 'post_comment',
				content: `${commenter.fullName} đã bình luận về bài viết của bạn: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
				data: {
					fromUserId: currentUserId,
					fromUserName: commenter.fullName,
					fromUserAvatar: commenter.profilePicture,
					postId: postId,
					commentId: saved._id,
					commentContent: content,
					postContent: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '')
				}
			});
		}
		
		// Trả về comment đã populate tác giả
		return this.commentRepository.findCommentById(saved._id);
	}

	async getPostComments(postId, userId, options) {
		const comments = await this.commentRepository.findCommentsByPostId(postId, options);
		
		// Collect all IDs including replies to compute liked state comprehensively
		const allIds = [];
		for (const c of comments) {
			if (c?._id) allIds.push(c._id);
			if (Array.isArray(c.replies)) {
				for (const r of c.replies) {
					if (r?._id) allIds.push(r._id);
				}
			}
		}
		
		// Get liked IDs for current user across roots and replies
		const likedIds = await this.likeRepository.findLikedCommentIdsForUser(userId, allIds);
		
		// Add isLiked to roots and replies
		const commentsWithLiked = comments.map(comment => ({
			...comment,
			isLiked: likedIds.includes(comment._id.toString()),
			replies: Array.isArray(comment.replies)
				? comment.replies.map(reply => ({
					...reply,
					isLiked: likedIds.includes(reply._id.toString()),
				}))
				: comment.replies,
		}));
		
		return commentsWithLiked;
	}

	async getCommentReplies(commentId, userId, options) {
		const replies = await this.commentRepository.findRepliesByCommentId(commentId, options);
		
		// Get liked comment IDs for current user
		const replyIds = replies.map(r => r._id);
		const likedReplyIds = await this.likeRepository.findLikedCommentIdsForUser(userId, replyIds);
		
		// Add isLiked field to each reply
		const repliesWithLiked = replies.map(reply => ({
			...reply,
			isLiked: likedReplyIds.includes(reply._id.toString())
		}));
		
		return repliesWithLiked;
	}

	// Update comment owned by user (only content)
	async updateCommentOwned(currentUserId, commentId, { content }) {
		if (!content || typeof content !== 'string' || content.trim() === '') return false;
		const existing = await this.commentRepository.findCommentById(commentId);
		if (!existing) return false;
		if (String(existing.author?._id || existing.author) !== String(currentUserId)) {
			return false;
		}
		const updated = await this.commentRepository.updateComment(commentId, { content });
		return updated;
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
		// Decrement counters and cascade delete for replies if root
		if (existing.parentId) {
			// deleting a reply
			await this.commentRepository.decrementReplyCount(existing.parentId);
			await this.postRepository.decrementCommentCount(existing.postId);
		} else if (existing.postId) {
			// deleting a root comment: also delete its replies and decrement by 1 + replyCount
			const repliesCount = await this.commentRepository.countRepliesByCommentId(commentId);
			if (repliesCount > 0) {
				await this.commentRepository.deleteRepliesByParentId(commentId);
			}
			await this.postRepository.decrementCommentCountBy(existing.postId, 1 + repliesCount);
		}
		return true;
	}
}

module.exports = CommentService;
