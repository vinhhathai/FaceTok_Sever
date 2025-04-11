"use strict";
//----------------------------------------------------------------
const PostModel = require('../models/PostModel');

class PostRepository {
    constructor() {
        this.model = PostModel;
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async findByUserId(userId, options = { skip: 0, limit: 10 }) {
        return this.model.find({ 
            userId, 
            isDelete: false 
        })
        .populate('userId', 'fullName profilePicture username email')
        .populate({
            path: 'comments',
            select: 'content createdAt',
            populate: {
                path: 'userId',
                select: 'fullName profilePicture username'
            }
        })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .lean();
    }

    async findRecentPosts(options = { skip: 0, limit: 10 }) {
        return this.model.find({ isDelete: false })
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit);
    }

    async findPostsByUserIds(userIds, options = { skip: 0, limit: 10 }) {
        return this.model.find({ 
            userId: { $in: userIds }, 
            isDelete: false 
        })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit);
    }

    async create(postData) {
        return this.model.create(postData);
    }

    async update(postId, postData) {
        return this.model.findByIdAndUpdate(
            postId,
            { $set: postData },
            { new: true }
        );
    }

    async softDelete(postId) {
        return this.model.findByIdAndUpdate(
            postId,
            { $set: { isDelete: true } },
            { new: true }
        );
    }

    async likePost(postId, userId) {
        const post = await this.model.findById(postId);
        if (!post) return null;

        post.like(userId);
        await post.save();
        return post;
    }

    async unlikePost(postId, userId) {
        const post = await this.model.findById(postId);
        if (!post) return null;

        post.unlike(userId);
        await post.save();
        return post;
    }

    async getTotalPostCount(userId) {
        return this.model.countDocuments({ 
            userId, 
            isDelete: false 
        });
    }

    // Phương thức cho kiến trúc cũ
    async checkLikeStatus(postId, userId) {
        const post = await this.model.findById(postId);
        if (!post) return false;
        
        return post.likes.includes(userId);
    }

    async getUserFriends(userId) {
        // Lấy danh sách bạn bè từ model User
        const UserModel = require('../../user/models/UserModel');
        const user = await UserModel.findById(userId);
        if (!user) return [];
        
        return user.friends || [];
    }

    async getTotalTimelinePosts(userIds) {
        return this.model.countDocuments({ 
            userId: { $in: userIds }, 
            isDelete: false 
        });
    }
    
    // Phương thức mới - lấy tổng số bài viết có thể hiển thị
    async getTotalPostsCount() {
        return this.model.countDocuments({ isDelete: false });
    }
    
    // Phương thức mới - lấy các bài viết gần đây
    async getRecentPosts(limit = 100) {
        return this.model.find({ isDelete: false })
            .populate('userId', 'fullName profilePicture username email')
            .populate({
                path: 'comments',
                select: 'content createdAt',
                populate: {
                    path: 'userId',
                    select: 'fullName profilePicture username'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
}

module.exports = PostRepository; 