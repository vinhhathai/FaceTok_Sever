// "use strict";
// //----------------------------------------------------------------
// const FeedService = require('../services/FeedService');
// const { handleServiceResult } = require('../../../shared/helper/handleService');

// class FeedController {
//     constructor() {
//         this.feedService = FeedService;
//     }

//     getTimelinePosts = async (req, res) => {
//         try {
//             const userId = req.user.id;
//             const page = parseInt(req.query.page) || 1;
//             const limit = parseInt(req.query.limit) || 10;
            
//             const result = await this.feedService.getTimelinePosts(userId, page, limit);
            
//             return handleServiceResult(res, result);
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 error: {
//                     code: 'GET_POSTS_FAILED',
//                     message: 'Failed to get timeline posts',
//                     detail: error.message
//                 },
//                 timestamp: new Date().toISOString()
//             });
//         }
//     }

//     getUserPosts = async (req, res) => {
//         try {
//             const userId = req.params.userId;
//             const page = parseInt(req.query.page) || 1;
//             const limit = parseInt(req.query.limit) || 10;
            
//             const result = await this.feedService.getUserPosts(userId, page, limit);
            
//             return handleServiceResult(res, result);
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 error: {
//                     code: 'GET_USER_POSTS_FAILED',
//                     message: 'Failed to get user posts',
//                     detail: error.message
//                 },
//                 timestamp: new Date().toISOString()
//             });
//         }
//     }
// }

// module.exports = new FeedController(); 