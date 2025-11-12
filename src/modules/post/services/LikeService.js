const { LikeRepository, PostRepository, CommentRepository } = require('../repositories');
const NotificationService = require('../../notification/services/NotificationService');

class LikeService {
	constructor() {
		this.likeRepository = new LikeRepository();
		this.postRepository = new PostRepository();
		this.commentRepository = new CommentRepository();
		this.notificationService = new NotificationService();
	}

	async toggleLike(currentUserId, postId) {
		const result = await this.likeRepository.toggleLike(postId, currentUserId);
		
		if (result.action === 'liked') {
			await this.postRepository.incrementLikeCount(postId);
			
			// Gửi notification cho tác giả bài viết (nếu không phải chính mình)
			const post = await this.postRepository.findPostById(postId);
			if (post && post.author._id.toString() !== currentUserId) {

				const liker = await this.likeRepository.userModel.findById(currentUserId);
				
				await this.notificationService.createAndSend({
					user: post.author,
					type: 'post_like',
					content: `${liker.fullName} đã thích bài viết của bạn.`,
					data: {
						fromUserId: currentUserId,
						fromUserName: liker.fullName,
						fromUserAvatar: liker.profilePicture,
						postId: postId,
						postContent: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '')
					}
				});
			}
		} else if (result.action === 'unliked') {
			await this.postRepository.decrementLikeCount(postId);
		}
		
		return result;
	}

	async toggleCommentLike(currentUserId, commentId) {
		const result = await this.likeRepository.toggleCommentLike(commentId, currentUserId);
		
		if (result.action === 'liked') {
			await this.commentRepository.incrementLikeCount(commentId);
			
			// Gửi notification cho tác giả comment (nếu không phải chính mình)
			const comment = await this.commentRepository.findById(commentId);
			if (comment && comment.userId.toString() !== currentUserId) {
				const liker = await this.likeRepository.userModel.findById(currentUserId);
				
				await this.notificationService.createAndSend({
					user: comment.userId,
					type: 'comment_like',
					content: `${liker.fullName} đã thích bình luận của bạn.`,
					data: {
						fromUserId: currentUserId,
						fromUserName: liker.fullName,
						fromUserAvatar: liker.profilePicture,
						commentId: commentId,
						commentContent: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '')
					}
				});
			}
		} else if (result.action === 'unliked') {
			await this.commentRepository.decrementLikeCount(commentId);
		}
		
		return result;
	}
}

module.exports = LikeService;
