"use strict";
//----------------------------------------------------------------
const PostRepository = require('../repositories/PostRepository');
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class PostManagementService {
    constructor() {
        this.postRepository = new PostRepository();
    }

    async getPostById(postId) {
        try {
            const post = await this.postRepository.findById(postId);
            
            if (!post || post.isDelete) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.POST_NOT_FOUND,
                        message: errorMessage.POST_NOT_FOUND
                    }
                };
            }
            
            return {
                success: true,
                statusCode: 200,
                data: post
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_GET_DATA_FAILED,
                    message: error.message
                }
            };
        }
    }
    
    async createPost(postData) {
        try {
            const newPost = await this.postRepository.create(postData);
            
            return {
                success: true,
                statusCode: 201,
                data: newPost
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.CREATE_POST_FAILED,
                    message: error.message
                }
            };
        }
    }

    async updatePost(postId, userId, postData) {
        try {
            const post = await this.postRepository.findById(postId);
            
            if (!post || post.isDelete) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.POST_NOT_FOUND,
                        message: errorMessage.POST_NOT_FOUND
                    }
                };
            }
            
            // Kiểm tra quyền sở hữu
            if (post.userId.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            const updatedPost = await this.postRepository.update(postId, postData);
            
            return {
                success: true,
                statusCode: 200,
                data: updatedPost
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.UPDATE_POST_FAILED,
                    message: error.message
                }
            };
        }
    }

    async deletePost(postId, userId) {
        try {
            const post = await this.postRepository.findById(postId);
            
            if (!post || post.isDelete) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.POST_NOT_FOUND,
                        message: errorMessage.POST_NOT_FOUND
                    }
                };
            }
            
            // Kiểm tra quyền sở hữu
            if (post.userId.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            await this.postRepository.softDelete(postId);
            
            return {
                success: true,
                statusCode: 200,
                data: { message: 'Post deleted successfully' }
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.DELETE_POST_FAILED,
                    message: error.message
                }
            };
        }
    }
}

module.exports = new PostManagementService(); 