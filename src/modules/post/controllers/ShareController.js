const { ShareService } = require('../services');

class ShareController {
	constructor() {
		this.shareService = new ShareService();
	}

	// POST /post/:postId/share/toggle
	toggle = async (req, res) => {
		try {
			const userId = req.user.id;
			const { postId } = req.params;
			const result = await this.shareService.toggleShare(userId, postId);
			return res.status(200).json({ success: true, data: result });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	};
}

module.exports = ShareController;
