'use strict';

const PostModel = require("../../models/PostModel");
const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');
const mongoose = require('mongoose');

//----------------------------------------------------------------


// Lấy bài viết của một người dùng cụ thể
exports.getUserPosts = async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        // Kiểm tra người dùng có tồn tại không
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        // Đếm tổng số bài viết để phân trang
        const totalPosts = await PostModel.countDocuments({ 
            userId: userId,
            isDelete: false
        });

        // Lấy bài viết của người dùng
        const posts = await PostModel.find({ 
            userId: userId,
            isDelete: false
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName profilePicture username');

        // Format lại dữ liệu để phù hợp với frontend
        const formattedPosts = posts.map(post => {
            return {
                _id: post._id,
                content: post.caption,
                author: {
                    _id: post.userId._id,
                    fullName: post.userId.fullName,
                    profilePicture: post.userId.profilePicture,
                    username: post.userId.username
                },
                media: post.filePath ? [{ url: post.filePath }] : [],
                likesCount: post.likesCount || 0,
                commentsCount: post.commentsCount || 0,
                createdAt: post.createdAt
            };
        });

        return res.status(200).json({
            posts: formattedPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts: totalPosts
        });

    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            code: errorCode.INTERNAL_SERVER_ERROR,
            error: {
                name: error.message
            }
        });
    }
};

// Lấy bài viết timeline theo thuật toán ưu tiên
exports.getTimelinePosts = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. Lấy danh sách bạn bè của người dùng
        const currentUser = await UserModel.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.USER_NOT_FOUND
                }
            });
        }

        const friendIds = currentUser.friends || [];
        
        // Thời gian hiện tại để tính điểm cho posts gần đây
        const currentTime = new Date();
        // Thời gian 1 tuần trước để đánh giá tăng trưởng tương tác
        const oneWeekAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Thời gian 1 ngày trước để đánh giá tăng trưởng tương tác nhanh
        const oneDayAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

        // 2. Tính tổng số bài viết để phân trang (chỉ đếm bài viết còn hoạt động)
        const totalPosts = await PostModel.countDocuments({ isDelete: false });

        // 3. Lấy tất cả bài viết và sắp xếp theo thuật toán
        const posts = await PostModel.find({ isDelete: false })
            .populate('userId', 'fullName profilePicture username')
            .sort({ createdAt: -1 }) // Mặc định sắp xếp theo thời gian giảm dần
            .limit(Math.min(100, limit * 3)); // Lấy nhiều hơn để sắp xếp

        // 4. Tính điểm cho mỗi bài viết dựa trên thuật toán
        const scoredPosts = posts.map(post => {
            // Cơ sở điểm là 0
            let score = 0;
            
            // Ưu tiên 1: Thời gian tạo post (ưu tiên post mới)
            // Posts mới hơn có điểm cao hơn
            const postAge = (currentTime - new Date(post.createdAt)) / (1000 * 60 * 60); // Tuổi theo giờ
            const timeScore = Math.max(0, 100 - postAge); // Điểm tối đa 100, giảm dần theo thời gian
            score += timeScore;
            
            // Ưu tiên 2: Lượng tương tác (likes, comments)
            // Mỗi like đáng giá 2 điểm, mỗi comment đáng giá 3 điểm
            const interactionScore = (post.likesCount || 0) * 2 + (post.commentsCount || 0) * 3;
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
        
        // 5. Sắp xếp posts theo điểm và lấy theo phân trang
        const sortedPosts = scoredPosts
            .sort((a, b) => b.score - a.score)
            .slice(skip, skip + limit)
            .map(item => item.post);

        // 6. Format lại dữ liệu để phù hợp với frontend
        const formattedPosts = sortedPosts.map(post => {
            return {
                _id: post._id,
                content: post.caption,
                author: {
                    _id: post.userId._id,
                    fullName: post.userId.fullName,
                    profilePicture: post.userId.profilePicture,
                    username: post.userId.username
                },
                media: post.filePath ? [{ url: post.filePath }] : [],
                likesCount: post.likesCount || 0,
                commentsCount: post.commentsCount || 0,
                createdAt: post.createdAt
            };
        });

        // 7. Trả về kết quả
        return res.status(200).json({
            posts: formattedPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts: totalPosts
        });

    } catch (error) {
        console.error('Error in getTimelinePosts:', error);
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            code: errorCode.INTERNAL_SERVER_ERROR,
            error: {
                name: error.message
            }
        });
    }
}; 