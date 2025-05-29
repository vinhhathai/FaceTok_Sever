"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { ProfileService } = require("../services");
const { ProfileDto } = require("../dtos");
const { profileValidation, updateProfileValidation } = require("../validations");
const { processAndUploadImage } = require('../../../shared/utils/cloudinaryUpload');

/**
 * Controller xử lý các chức năng liên quan đến profile người dùng
 */
class ProfileController {
  constructor() {
    this.profileService = new ProfileService();
  }

  /**
   * Xem thông tin profile của người dùng theo ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProfile = async (req, res) => {
    try {
      // Lấy ID người dùng đang đăng nhập từ token
      const viewerId = req.user?.id;
      
      // Lấy ID người dùng cần xem profile từ params
      const targetUserId = req.params.id;

      // Kiểm tra ID
      if (!targetUserId) {
        return res.status(400).json(
          ProfileDto.error(
            errorCode.VALIDATION_FAILED,
            errorMessage.ID_NOT_FOUND
          )
        );
      }
      
      // Bổ sung kiểm tra bảo mật: Nếu không phải xem profile của chính mình, cần kiểm tra quyền
      // Phương pháp đơn giản: cho phép xem (có thể mở rộng để kiểm tra mối quan hệ bạn bè hoặc cài đặt riêng tư)
      // Trong thực tế, bạn có thể thêm logic kiểm tra chi tiết hơn ở đây
      
      // Log thông tin để theo dõi
      console.log(`User ${viewerId} is viewing profile of user ${targetUserId}`);

      // Gọi service để lấy thông tin profile
      const result = await this.profileService.getProfile(targetUserId);

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Error in getProfile controller:", error);
      return res.status(500).json(
        ProfileDto.error(
          errorCode.ERR_RETRIEVE_PROFILE_FAILED,
          error.message || "Lỗi khi lấy thông tin profile"
        )
      );
    }
  };

  /**
   * Cập nhật thông tin profile của người dùng
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateProfile = async (req, res) => {
    try {
      console.log("Update profile request received");

      // Lấy ID người dùng từ token thay vì params
      const tokenUserId = req.user?.id;
      
      // Dùng ID từ token, không phụ thuộc vào params
      const userId = tokenUserId;
      
      console.log(`Using token user ID for profile update: ${userId}`);
      
      // Validate thông tin đầu vào
      const { error, value } = updateProfileValidation(req.body);
      if (error) {
        return res.status(400).json(
          ProfileDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }

      // Kiểm tra ID người dùng
      if (!userId) {
        return res.status(400).json(
          ProfileDto.error(
            errorCode.VALIDATION_FAILED,
            "ID người dùng không hợp lệ hoặc không được xác thực"
          )
        );
      }

      console.log(`Update profile for user ${userId} with data:`, value);

      // Gọi service để cập nhật thông tin profile
      const result = await this.profileService.updateProfile(userId, value);

      // Kiểm tra kết quả và trả về response phù hợp
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Error in updateProfile controller:", error);
      return res.status(500).json(
        ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          error.message || "Lỗi khi cập nhật thông tin profile"
        )
      );
    }
  };

  /**
   * Update user's cover photo
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  updateCoverPhoto = async (req, res) => {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json(
          ProfileDto.error(
            errorCode.VALIDATION_FAILED,
            'Không tìm thấy ảnh bìa'
          )
        );
      }
      
      const userId = req.user.id; // Assuming user ID is available from auth middleware
      
      // Image processing options for cover photos
      const imageOptions = {
        width: 1200,
        height: 400,
        fit: 'cover',
        format: 'jpeg',
        quality: 80,
      };
      
      // Upload options for Cloudinary
      const uploadOptions = {
        public_id: `user_${userId}_thumbnail_${Date.now()}`, // Unique identifier
        tags: ['thumbnail', `user_${userId}`],
        transformation: [
          { width: 1200, height: 400, crop: 'fill', gravity: 'auto' }
        ]
      };
      
      // Process and upload image
      const result = await processAndUploadImage(
        req.file.buffer,
        'chaotok/thumbnails', // Cloudinary folder
        imageOptions,
        uploadOptions
      );
      
      // Update user's cover photo URL in database
      // This would normally be handled by a service that updates the user record
      // userService.updateUserById(userId, { coverPhoto: result.secure_url });
      
      // Return success response
      return res.status(200).json({
        success: true,
        data: {
          coverPhotoUrl: result.secure_url,
          publicId: result.public_id
        }
      });
      
    } catch (error) {
      console.error("Error in updateCoverPhoto controller:", error);
      return res.status(500).json(
        ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          error.message || "Lỗi khi cập nhật ảnh bìa"
        )
      );
    }
  };

  /**
   * Update user's profile picture
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  updateProfilePicture = async (req, res) => {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json(
          ProfileDto.error(
            errorCode.VALIDATION_FAILED,
            'Không tìm thấy ảnh hồ sơ'
          )
        );
      }
      
      const userId = req.user.id; // Assuming user ID is available from auth middleware
      
      // Image processing options for profile pictures
      const imageOptions = {
        width: 400,
        height: 400,
        fit: 'cover',
        format: 'jpeg',
        quality: 85,
      };
      
      // Upload options for Cloudinary
      const uploadOptions = {
        public_id: `user_${userId}_profile_${Date.now()}`, // Unique identifier
        tags: ['profile_picture', `user_${userId}`],
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }
        ]
      };
      
      // Process and upload image
      const result = await processAndUploadImage(
        req.file.buffer,
        'chaotok/avatars', // Cloudinary folder
        imageOptions,
        uploadOptions
      );
      
      // Update user's profile picture URL in database
      // userService.updateUserById(userId, { profilePicture: result.secure_url });
      
      // Return success response
      return res.status(200).json({
        success: true,
        data: {
          profilePictureUrl: result.secure_url,
          publicId: result.public_id
        }
      });
      
    } catch (error) {
      console.error("Error in updateProfilePicture controller:", error);
      return res.status(500).json(
        ProfileDto.error(
          errorCode.UPDATE_PROFILE_FAILED,
          error.message || "Lỗi khi cập nhật ảnh hồ sơ"
        )
      );
    }
  };
}

module.exports = ProfileController; 