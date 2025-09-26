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
			// no longer used; keeping branch for backward compatibility
		} else if (result.action === 'exists') {
			// idempotent: do nothing
		}
		return result;
	}
}

module.exports = ShareService;
