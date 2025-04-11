"use strict";
//----------------------------------------------------------------
const PostInteractionService = require('../services/PostInteractionService');

class PostInteractionController {
    constructor() {
        this.postInteractionService = PostInteractionService;
    }

    likePost = async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.id;
        
        const result = await this.postInteractionService.likePost(postId, userId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                liked: true,
                likesCount: result.data.likesCount
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/${postId}/like`,
                error: result.error 
            });
        }
    }

    unlikePost = async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.id;
        
        const result = await this.postInteractionService.unlikePost(postId, userId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                liked: false,
                likesCount: result.data.likesCount
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/${postId}/unlike`,
                error: result.error 
            });
        }
    }

    toggleLike = async (req, res) => {
        const postId = req.params.postId;
        const userId = req.user.id;
        
        const result = await this.postInteractionService.toggleLike(postId, userId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                liked: result.data.liked,
                message: result.data.message
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/like/${postId}`,
                error: result.error 
            });
        }
    }

    checkLikeStatus = async (req, res) => {
        const postId = req.params.postId;
        const userId = req.user.id;
        
        const result = await this.postInteractionService.checkLikeStatus(postId, userId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                liked: result.data.liked
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/like/${postId}/status`,
                error: result.error 
            });
        }
    }
}

module.exports = new PostInteractionController(); 