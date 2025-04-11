"use strict";
//----------------------------------------------------------------
const FeedService = require('../services/FeedService');

class FeedController {
    constructor() {
        this.feedService = FeedService;
    }

    getTimelinePosts = async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await this.feedService.getTimelinePosts(userId, page, limit);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                posts: result.data.posts,
                page: result.data.page,
                limit: result.data.limit,
                total: result.data.total,
                totalPages: result.data.totalPages
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: '/post',
                error: result.error 
            });
        }
    }

    getUserPosts = async (req, res) => {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await this.feedService.getUserPosts(userId, page, limit);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                posts: result.data.posts,
                page: result.data.page,
                limit: result.data.limit,
                total: result.data.total,
                totalPages: result.data.totalPages
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/user/${userId}`,
                error: result.error 
            });
        }
    }
}

module.exports = new FeedController(); 