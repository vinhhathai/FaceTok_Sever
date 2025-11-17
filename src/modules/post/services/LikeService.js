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
		
		// Chỉ tăng likesCount khi THỰC SỰ tạo bản ghi like mới
		if (result.action === 'liked' && result.like) {
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
		
		// Chỉ tăng likesCount khi THỰC SỰ tạo bản ghi like mới
		if (result.action === 'liked' && result.like) {
			await this.commentRepository.incrementLikeCount(commentId);
			// Gửi notification cho tác giả comment (nếu không phải chính mình)
			const comment = await this.commentRepository.findCommentById(commentId);
			const commentAuthorId = comment?.author?._id || comment?.author;
			if (comment && commentAuthorId && String(commentAuthorId) !== String(currentUserId)) {
				try {
					const liker = await this.likeRepository.userModel.findById(currentUserId);
					await this.notificationService.createAndSend({
						receivers: [commentAuthorId],
						title: 'Comment Liked',
						message: `${liker.fullName} liked your comment`,
						thumbnailUrl: liker?.profilePicture || '',
						priority: 'low',
						type: 'activity',
						ref: {
							modelName: 'comments',
							refMethodName: 'getDetail',
							id: commentId,
						},
					});
				} catch (notifyErr) {
					// Notification failures should not break like toggling
				}
			}
		} else if (result.action === 'unliked') {
			await this.commentRepository.decrementLikeCount(commentId);
		}
		
		// Đồng bộ lại likesCount theo dữ liệu thực tế để tránh sai lệch do race condition
		try {
			const actualCount = await this.likeRepository.countLikesByCommentId(commentId);
			await this.commentRepository.setLikeCount(commentId, actualCount);
		} catch (syncErr) {
			// Không để lỗi đồng bộ làm hỏng kết quả chính
		}
		
		return result;
	}
}

module.exports = LikeService;
