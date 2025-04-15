"use strict";
//----------------------------------------------------------------
const PostRepository = require('../repositories/PostRepository');
const { errorCode, errorMessage } = require('../../../shared/common/error');

class PostService {
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

    async getUserPosts(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const posts = await this.postRepository.findByUserId(userId, { skip, limit });
            const totalPosts = await this.postRepository.getTotalPostCount(userId);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    posts,
                    page,
                    limit,
                    total: totalPosts,
                    totalPages: Math.ceil(totalPosts / limit)
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

    async getNewsFeed(userIds, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const posts = await this.postRepository.findPostsByUserIds(userIds, { skip, limit });
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    posts,
                    page,
                    limit
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

    // Phương thức cho kiến trúc cũ
    async getTimelinePosts(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            // Lấy danh sách bạn bè của người dùng
            const friends = await this.postRepository.getUserFriends(userId);
            const friendIds = friends || [];
            
            // Thời gian hiện tại để tính điểm cho posts gần đây
            const currentTime = new Date();
            // Thời gian 1 tuần trước để đánh giá tăng trưởng tương tác
            const oneWeekAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
            // Thời gian 1 ngày trước để đánh giá tăng trưởng tương tác nhanh
            const oneDayAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
            
            // Lấy tổng số bài viết để phân trang
            const totalPosts = await this.postRepository.getTotalPostsCount();
            
            // Lấy các bài viết gần đây để tính điểm
            const recentPosts = await this.postRepository.getRecentPosts(Math.min(100, limit * 3));
            
            // Tính điểm cho mỗi bài viết dựa trên thuật toán
            const scoredPosts = recentPosts.map(post => {
                // Cơ sở điểm là 0
                let score = 0;
                
                // Ưu tiên 1: Thời gian tạo post (ưu tiên post mới)
                // Posts mới hơn có điểm cao hơn
                const postAge = (currentTime - new Date(post.createdAt)) / (1000 * 60 * 60); // Tuổi theo giờ
                const timeScore = Math.max(0, 100 - postAge); // Điểm tối đa 100, giảm dần theo thời gian
                score += timeScore;
                
                // Ưu tiên 2: Lượng tương tác (likes, comments)
                // Mỗi like đáng giá 2 điểm, mỗi comment đáng giá 3 điểm
                const interactionScore = (post.likes.length || 0) * 2 + (post.comments.length || 0) * 3;
                score += interactionScore;
                
                // Ưu tiên 3: Mối quan hệ (ưu tiên post từ bạn bè)
                // Post từ bạn bè được cộng 50 điểm
                const isFriend = friendIds.some(friendId =>
                    friendId.toString() === post.userId._id.toString()
                );
                if (isFriend) {
                    score += 50;
                }
                
                // Ưu tiên 4: Tăng trưởng tương tác (post mới có lượng tương tác tăng nhanh)
                // Nếu post trong 24h gần đây có tương tác cao, boost điểm
                const isRecent = post.createdAt > oneDayAgo;
                if (isRecent && interactionScore > 10) {
                    score += 30; // Boost thêm 30 điểm cho post mới có tương tác cao
                }
                
                // Ưu tiên 5: Đa dạng hóa (đôi khi chèn vài post random từ người lạ)
                // Áp dụng yếu tố ngẫu nhiên để đa dạng hóa feed
                const randomBoost = Math.random() * 10; // Ngẫu nhiên từ 0-10 điểm
                score += randomBoost;
                
                return {
                    post,
                    score
                };
            });
            
            // Sắp xếp posts theo điểm và lấy theo phân trang
            const sortedPosts = scoredPosts
                .sort((a, b) => b.score - a.score)
                .slice(skip, skip + limit)
                .map(item => item.post);
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    posts: sortedPosts,
                    page,
                    limit,
                    total: totalPosts,
                    totalPages: Math.ceil(totalPosts / limit)
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

    // Phương thức cho kiến trúc cũ - toggle like/unlike
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

    // Phương thức cho kiến trúc cũ - kiểm tra trạng thái like
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

// Export instance thay vì class
module.exports = new PostService(); 