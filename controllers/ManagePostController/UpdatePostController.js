'use strict';

const PostModel = require('../../models/PostModel');
const mongoose = require('mongoose');

/**
 * Cập nhật nội dung bài viết
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response với thông báo kết quả và bài viết đã cập nhật
 */
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;
    const userId = req.user.user_id; // Lấy từ checkLogin middleware

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

    // Kiểm tra xem người dùng có phải là chủ sở hữu bài viết
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bài viết này'
      });
    }

    // Cập nhật caption của bài viết
    post.caption = caption;
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Bài viết đã được cập nhật thành công',
      post: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật bài viết',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
}; 