"use strict";
//----------------------------------------------------------------
const PostRepository = require('../repositories/PostRepository');
const { errorCode, errorMessage } = require('../../../shared/utils/error');

class PostInteractionService {
    constructor() {
        this.postRepository = new PostRepository();
    }

    async likePost(postId, userId) {
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
            
            const updatedPost = await this.postRepository.likePost(postId, userId);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    likesCount: updatedPost.likesCount,
                    liked: true
                }
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

    async unlikePost(postId, userId) {
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
            
            const updatedPost = await this.postRepository.unlikePost(postId, userId);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    likesCount: updatedPost.likesCount,
                    liked: false
                }
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

    async toggleLike(postId, userId) {
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
            
            // Kiểm tra xem người dùng đã like bài viết chưa
            const hasLiked = await this.postRepository.checkLikeStatus(postId, userId);
            
            if (hasLiked) {
                // Nếu đã like, thì unlike
                await this.postRepository.unlikePost(postId, userId);
                return {
                    success: true,
                    statusCode: 200,
                    data: { liked: false, message: 'Post unliked successfully' }
                };
            } else {
                // Nếu chưa like, thì like
                await this.postRepository.likePost(postId, userId);
                return {
                    success: true,
                    statusCode: 200,
                    data: { liked: true, message: 'Post liked successfully' }
                };
            }
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                error: {
                    code: errorCode.ERR_INTERNAL_SERVER,
                    message: error.message
                }
            };
        }
    }

    async checkLikeStatus(postId, userId) {
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
            
            const hasLiked = await this.postRepository.checkLikeStatus(postId, userId);
            
            return {
                success: true,
                statusCode: 200,
                data: { liked: hasLiked }
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
}

module.exports = new PostInteractionService(); 