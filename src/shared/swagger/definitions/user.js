"use strict";
//----------------------------------------------------------------

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID của người dùng
 *         fullName:
 *           type: string
 *           description: Tên đầy đủ của người dùng
 *         email:
 *           type: string
 *           format: email
 *           description: Email của người dùng
 *         profilePicture:
 *           type: string
 *           description: URL ảnh đại diện
 *         thumbnail:
 *           type: string
 *           description: URL ảnh bìa
 *         birthday:
 *           type: string
 *           format: date
 *           description: Ngày sinh (định dạng YYYY-MM-DD)
 *         bio:
 *           type: string
 *           description: Tiểu sử
 *         gender:
 *           type: string
 *           enum: [male, female, undefined]
 *           description: Giới tính
 *         location:
 *           type: string
 *           description: Vị trí/địa chỉ
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm tạo tài khoản
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm cập nhật gần nhất
 *
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Trạng thái lấy thông tin profile
 *         message:
 *           type: string
 *           description: Thông báo từ server
 *         data:
 *           $ref: '#/components/schemas/UserProfile'
 *         path:
 *           type: string
 *           description: Đường dẫn API
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Thời điểm phản hồi
 */ 