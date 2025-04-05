'use strict';

const CommentModel = require('../../models/CommentModel');
const PostModel = require('../../models/PostModel');
const mongoose = require('mongoose');
const { errorCode, errorMessage } = require('../../common/enum/error');
const NotificationController = require('../NotificationController/NotificationController');

/**
 * Thêm bình luận cho bài viết
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response với thông tin bình luận vừa tạo
 */
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.user_id; // Lấy từ checkLogin middleware

    // Validate input
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    // Kiểm tra định dạng ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }

    // Tìm bài viết theo ID
    const post = await PostModel.findById(postId);

    // Kiểm tra xem bài viết có tồn tại không
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Tạo comment mới
    const newComment = new CommentModel({
      postId,
      userId,
      text,
      parentId: null // Comment gốc, không phải reply
    });

    // Lưu comment
    await newComment.save();

    // Tăng số lượng comments của bài viết
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    // Gửi thông báo đến chủ bài viết nếu không phải chính họ comment
    if (post.userId && post.userId.toString() !== userId.toString()) {
      await NotificationController.createNotification({
        recipient: post.userId,
        sender: userId,
        type: 'comment',
        post: postId,
        comment: newComment._id
      });
    }

    // Populate thông tin người dùng
    await newComment.populate('userId', 'fullName profilePicture');

    return res.status(201).json({
      success: true,
      message: 'Đã thêm bình luận thành công',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi thêm bình luận',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
};

/**
 * Lấy danh sách bình luận của bài viết
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response với danh sách bình luận
 */
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Kiểm tra định dạng ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }

    // Lấy tổng số bình luận của bài viết
    const totalComments = await CommentModel.countDocuments({
      postId,
      parentId: null
    });

    // Lấy danh sách comment với phân trang
    const comments = await CommentModel.find({
      postId,
      parentId: null
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName profilePicture');

    const totalPages = Math.ceil(totalComments / limit);

    return res.status(200).json({
      success: true,
      comments,
      page,
      totalPages,
      totalComments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy bình luận',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
};

/**
 * Xóa bình luận
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response success/failure
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.user_id;

    // Kiểm tra định dạng ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bình luận không hợp lệ'
      });
    }

    // Tìm comment
    const comment = await CommentModel.findById(commentId);

    // Kiểm tra xem comment có tồn tại không
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Chỉ cho phép chủ sở hữu comment xóa comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }

    // Lấy postId trước khi xóa comment
    const postId = comment.postId;

    // Xóa comment
    await CommentModel.findByIdAndDelete(commentId);

    // Giảm số lượng comments của bài viết
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -1 }
    });

    return res.status(200).json({
      success: true,
      message: 'Đã xóa bình luận thành công'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa bình luận',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
}; 