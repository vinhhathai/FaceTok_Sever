"use strict";
//----------------------------------------------------------------
const { PostRepository } = require("../../post/repositories");
const { errorCode } = require("../../../shared/common/error");

/**
 * Service xử lý các chức năng liên quan đến media gallery của user
 */
class MediaService {
  constructor() {
    this.postRepository = new PostRepository();
  }

  /**
   * Lấy tất cả media files (ảnh, video) của user từ posts
   * @param {Object} params - Parameters
   * @param {string} params.userId - ID của user
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng items per page
   * @param {string} params.type - Loại media ('image', 'video', hoặc undefined cho tất cả)
   * @returns {Object} - Kết quả chứa media files và pagination info
   */
  async getUserMedia({ userId, page = 1, limit = 20, type }) {
    try {
      // Lấy tất cả posts của user (chỉ public posts nếu không phải chủ sở hữu)
      const postsResult = await this.postRepository.findPostsByAuthor(
        userId,
        { page: 1, limit: 1000 }, // Lấy nhiều posts để extract media
        { currentUserId: userId, includePrivate: true } // Bao gồm private posts nếu là chủ sở hữu
      );

      if (!postsResult || !postsResult.posts) {
        return {
          media: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        };
      }

      // Extract media từ tất cả posts
      let allMedia = [];
      
      postsResult.posts.forEach(post => {
        if (post.media && Array.isArray(post.media)) {
          post.media.forEach(mediaItem => {
            // Filter theo type nếu được chỉ định
            if (!type || mediaItem.type === type) {
              allMedia.push({
                id: `${post._id}_${mediaItem._id || Date.now()}`,
                postId: post._id,
                type: mediaItem.type,
                url: mediaItem.url,
                publicId: mediaItem.publicId,
                createdAt: post.createdAt,
                postContent: post.content ? post.content.substring(0, 100) : '',
                author: post.author
              });
            }
          });
        }
      });

      // Sắp xếp theo thời gian tạo (mới nhất trước)
      allMedia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const total = allMedia.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMedia = allMedia.slice(startIndex, endIndex);

      return {
        media: paginatedMedia,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };

    } catch (error) {
      console.error("Error in MediaService.getUserMedia:", error);
      throw new Error(`Failed to retrieve user media: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê media của user
   * @param {string} userId - ID của user
   * @returns {Object} - Thống kê media
   */
  async getUserMediaStats(userId) {
    try {
      const postsResult = await this.postRepository.findPostsByAuthor(
        userId,
        { page: 1, limit: 1000 },
        { currentUserId: userId, includePrivate: true }
      );

      if (!postsResult || !postsResult.posts) {
        return {
          totalMedia: 0,
          totalImages: 0,
          totalVideos: 0
        };
      }

      let totalImages = 0;
      let totalVideos = 0;

      postsResult.posts.forEach(post => {
        if (post.media && Array.isArray(post.media)) {
          post.media.forEach(mediaItem => {
            if (mediaItem.type === 'image') {
              totalImages++;
            } else if (mediaItem.type === 'video') {
              totalVideos++;
            }
          });
        }
      });

      return {
        totalMedia: totalImages + totalVideos,
        totalImages,
        totalVideos
      };

    } catch (error) {
      console.error("Error in MediaService.getUserMediaStats:", error);
      throw new Error(`Failed to retrieve user media stats: ${error.message}`);
    }
  }
}

module.exports = MediaService;