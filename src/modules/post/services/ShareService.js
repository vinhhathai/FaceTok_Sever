const { ShareRepository, PostRepository } = require('../repositories');

class ShareService {
	constructor() {
		this.shareRepository = new ShareRepository();
		this.postRepository = new PostRepository();
	}

	async toggleShare(currentUserId, postId) {
		const result = await this.shareRepository.toggleShare(postId, currentUserId);
		if (result.action === 'shared') {
			await this.postRepository.incrementShareCount(postId);
		} else if (result.action === 'unshared') {
			// Optionally decrement; depends on business rule
		}
		return result;
	}
}

module.exports = ShareService;
