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
		try {
			const result = await this.likeRepository.toggleLike(postId, currentUserId);
			
			if (result.action === 'liked') {
				await this.postRepository.incrementLikeCount(postId);
				
				// Gửi notification cho tác giả bài viết (nếu không phải chính mình)
				try {
					const post = await this.postRepository.findPostById(postId);
					if (post && post.author && post.author._id && post.author._id.toString() !== currentUserId) {
						const liker = await this.likeRepository.userModel.findById(currentUserId);
						
						if (liker) {
							await this.notificationService.createAndSend({
								user: post.author._id || post.author,
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
					}
				} catch (notifError) {
					// Log notification error but don't fail the like action
					console.error('Error sending like notification:', notifError);
				}
			} else if (result.action === 'unliked') {
				await this.postRepository.decrementLikeCount(postId);
			}
			
			return result;
		} catch (error) {
			console.error('Error in toggleLike:', error);
			throw error;
		}
	}

	async toggleCommentLike(currentUserId, commentId) {
		try {
			const result = await this.likeRepository.toggleCommentLike(commentId, currentUserId);
			
			if (result.action === 'liked') {
				await this.commentRepository.incrementLikeCount(commentId);
				
				// Gửi notification cho tác giả comment (nếu không phải chính mình)
				try {
					const comment = await this.commentRepository.findById(commentId);
					if (comment && comment.userId && comment.userId.toString() !== currentUserId) {
						const liker = await this.likeRepository.userModel.findById(currentUserId);
						
						if (liker) {
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
					}
				} catch (notifError) {
					// Log notification error but don't fail the like action
					console.error('Error sending comment like notification:', notifError);
				}
			} else if (result.action === 'unliked') {
				await this.commentRepository.decrementLikeCount(commentId);
			}
			
			return result;
		} catch (error) {
			console.error('Error in toggleCommentLike:', error);
			throw error;
		}
	}
}

module.exports = LikeService;
