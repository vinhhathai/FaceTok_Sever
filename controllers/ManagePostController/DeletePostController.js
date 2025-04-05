'use strict';

const PostModel = require('../../models/PostModel');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * Xóa bài viết vĩnh viễn
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response với thông báo kết quả
 */
exports.deletePost = async (req, res) => {
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

    // Kiểm tra xem người dùng có phải là chủ sở hữu bài viết
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này'
      });
    }

    // Nếu bài viết có file, xóa file trước
    if (post.filePath) {
      try {
        // Chuyển đổi URL thành đường dẫn file thực tế
        const filePath = post.filePath.replace(
          `${req.protocol}://${req.get('host')}/`,
          ''
        );
        const fullPath = path.join(process.cwd(), filePath);
        
        // Kiểm tra file tồn tại trước khi xóa
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Tiếp tục xóa bài viết ngay cả khi xóa file thất bại
      }
    }

    // Xóa bài viết từ cơ sở dữ liệu
    await PostModel.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: 'Bài viết đã được xóa vĩnh viễn'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa bài viết',
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
}; 