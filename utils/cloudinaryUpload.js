'use strict';

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzzvpvemu', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Upload file lên Cloudinary
 * @param {Buffer} buffer - Buffer của file cần upload
 * @param {Object} options - Options cho việc upload
 * @returns {Promise<Object>} - Kết quả upload từ Cloudinary
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Tạo stream từ buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'posts', // Thư mục lưu trữ ảnh bài viết
        resource_type: 'image', // Chỉ cho phép upload ảnh
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          return reject(error);
        }
        return resolve(result);
      }
    );

    // Pipe buffer vào stream để upload
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  uploadToCloudinary
}; 