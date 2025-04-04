'use strict';

const PostModel = require('../../models/PostModel');
const mongoose = require('mongoose');

/**
 * Toggle like/unlike bài viết
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response với thông tin cập nhật về bài viết
 */
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
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

    // Kiểm tra xem người dùng đã thích bài viết chưa
    const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
    let action = '';
    
    if (likeIndex === -1) {
      // Nếu chưa thích, thêm like
      post.likes.push(userId);
      action = 'liked';
    } else {
      // Nếu đã thích, bỏ like
      post.likes.splice(likeIndex, 1);
      action = 'unliked';
    }
    
    // Cập nhật số lượng like
    post.likesCount = post.likes.length;
    
    // Lưu thay đổi
    await post.save();

    return res.status(200).json({
      success: true,
      message: `Bạn đã ${action === 'liked' ? 'thích' : 'bỏ thích'} bài viết`,
      action: action,
      post: {
        _id: post._id,
        likesCount: post.likesCount,
        isLiked: action === 'liked'
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi thích/bỏ thích bài viết',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
};

/**
 * Kiểm tra người dùng đã thích bài viết chưa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response thông tin về trạng thái thích
 */
exports.checkLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id;

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

    // Kiểm tra xem người dùng đã thích bài viết chưa
    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    return res.status(200).json({
      success: true,
      isLiked: isLiked,
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error('Check like status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi kiểm tra trạng thái thích',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
}; 