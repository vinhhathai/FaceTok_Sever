const { LikeRepository, PostRepository } = require('../repositories');

class LikeService {
	constructor() {
		this.likeRepository = new LikeRepository();
		this.postRepository = new PostRepository();
	}

	async toggleLike(currentUserId, postId) {
		const result = await this.likeRepository.toggleLike(postId, currentUserId);
		if (result.action === 'liked') {
			await this.postRepository.incrementLikeCount(postId);
		} else if (result.action === 'unliked') {
			await this.postRepository.decrementLikeCount(postId);
		}
		return result;
	}
}

module.exports = LikeService;
