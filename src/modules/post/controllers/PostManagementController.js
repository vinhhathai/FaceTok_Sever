"use strict";
//----------------------------------------------------------------
const PostManagementService = require('../services/PostManagementService');

class PostManagementController {
    constructor() {
        this.postManagementService = PostManagementService;
    }

    createPost = async (req, res) => {
        const userId = req.user.id;
        
        // Lấy thông tin post từ request
        const { caption, filePath, fileType } = req.body;
        
        // Kiểm tra dữ liệu
        if (!filePath) {
            return res.status(400).json({
                success: false,
                timestamp: new Date().toISOString(),
                path: '/post/create',
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Media file is required'
                }
            });
        }
        
        const postData = {
            userId,
            caption,
            filePath,
            fileType
        };
        
        const result = await this.postManagementService.createPost(postData);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                postId: result.data._id,
                post: result.data
            });
        } else {
            return res.status(result.statusCode).json({
                success: false,
                timestamp: new Date().toISOString(),
                path: '/post/create',
                error: result.error 
            });
        }
    }

    getPostById = async (req, res) => {
        const postId = req.params.id;
        
        const result = await this.postManagementService.getPostById(postId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                post: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/${postId}`,
                error: result.error 
            });
        }
    }

    updatePost = async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.id;
        const updateData = req.body;
        
        const result = await this.postManagementService.updatePost(postId, userId, updateData);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                data: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/${postId}`,
                error: result.error 
            });
        }
    }

    deletePost = async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.id;
        
        const result = await this.postManagementService.deletePost(postId, userId);
        
        if (result.success) {
            return res.status(result.statusCode).json({
                success: true,
                data: result.data
            });
        } else {
            return res.status(result.statusCode).json({ 
                timestamp: new Date().toISOString(),
                path: `/post/${postId}`,
                error: result.error 
            });
        }
    }
}

module.exports = new PostManagementController(); 