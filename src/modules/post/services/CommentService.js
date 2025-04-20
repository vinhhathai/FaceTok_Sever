"use strict";
//----------------------------------------------------------------
const CommentRepository = require('../repositories/CommentRepository');
const PostRepository = require('../repositories/PostRepository');
const { errorCode, errorMessage } = require('../../../shared/common/error');

class CommentService {
    constructor() {
        this.commentRepository = new CommentRepository();
        this.postRepository = new PostRepository();
    }

    async getCommentsByPostId(postId, page = 1, limit = 20) {
        try {
            // Kiểm tra post có tồn tại không
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
            
            const skip = (page - 1) * limit;
            const comments = await this.commentRepository.findByPostId(postId, { skip, limit });
            const totalComments = await this.commentRepository.countByPostId(postId);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    comments,
                    page,
                    limit,
                    total: totalComments,
                    totalPages: Math.ceil(totalComments / limit)
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

    async createComment(commentData) {
        try {
            // Kiểm tra post có tồn tại không
            const post = await this.postRepository.findById(commentData.postId);
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
            
            const newComment = await this.commentRepository.create(commentData);
            
            return {
                success: true,
                statusCode: 201,
                data: newComment
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

    async updateComment(commentId, userId, text) {
        try {
            const comment = await this.commentRepository.findById(commentId);
            
            if (!comment) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.COMMENT_NOT_FOUND,
                        message: errorMessage.COMMENT_NOT_FOUND
                    }
                };
            }
            
            // Kiểm tra quyền sở hữu
            if (comment.userId.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            const updatedComment = await this.commentRepository.update(commentId, text);
            
            return {
                success: true,
                statusCode: 200,
                data: updatedComment
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

    async deleteComment(commentId, userId) {
        try {
            const comment = await this.commentRepository.findById(commentId);
            
            if (!comment) {
                return {
                    success: false,
                    statusCode: 404,
                    error: {
                        code: errorCode.COMMENT_NOT_FOUND,
                        message: errorMessage.COMMENT_NOT_FOUND
                    }
                };
            }
            
            // Kiểm tra quyền sở hữu
            if (comment.userId.toString() !== userId.toString()) {
                return {
                    success: false,
                    statusCode: 403,
                    error: {
                        code: errorCode.NOT_PERMISSIONS,
                        message: errorMessage.NOT_PERMISSIONS
                    }
                };
            }
            
            await this.commentRepository.delete(commentId);
            
            return {
                success: true,
                statusCode: 200,
                data: { message: 'Comment deleted successfully' }
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

// Export instance thay vì class
module.exports = new CommentService(); 