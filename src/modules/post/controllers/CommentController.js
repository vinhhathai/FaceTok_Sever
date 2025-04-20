"use strict";
//----------------------------------------------------------------
const CommentService = require('../services/CommentService');

class CommentController {
    constructor() {
        this.commentService = CommentService;
    }

    getComments = async (req, res) => {
        const postId = req.params.postId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await this.commentService.getCommentsByPostId(postId, page, limit);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/post/${postId}/comments`,
                    error: result.error 
                }
        );
    }

    createComment = async (req, res) => {
        const postId = req.params.postId;
        const userId = req.user.id;
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: `/post/${postId}/comments`,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Comment text is required'
                }
            });
        }
        
        const commentData = {
            postId,
            userId,
            text
        };
        
        const result = await this.commentService.createComment(commentData);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/post/${postId}/comments`,
                    error: result.error 
                }
        );
    }

    updateComment = async (req, res) => {
        const commentId = req.params.id;
        const userId = req.user.id;
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: `/comment/${commentId}`,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Comment text is required'
                }
            });
        }
        
        const result = await this.commentService.updateComment(commentId, userId, text);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/comment/${commentId}`,
                    error: result.error 
                }
        );
    }

    deleteComment = async (req, res) => {
        const commentId = req.params.id;
        const userId = req.user.id;
        
        const result = await this.commentService.deleteComment(commentId, userId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/comment/${commentId}`,
                    error: result.error 
                }
        );
    }
}

// Xuất ra instance của controller thay vì class
module.exports = new CommentController(); 