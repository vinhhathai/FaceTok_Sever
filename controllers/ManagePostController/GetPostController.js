'use strict';

const PostModel = require("../../models/PostModel");
const UserModel = require("../../models/UserModel");
const { errorCode, errorMessage } = require('../../common/enum/error');

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