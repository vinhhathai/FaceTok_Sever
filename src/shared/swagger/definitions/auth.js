"use strict";
//----------------------------------------------------------------

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email đăng nhập của người dùng
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu của người dùng
 *       example:
 *         email: user@example.com
 *         password: Password123
 * 
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Trạng thái đăng nhập
 *         message:
 *           type: string
 *           description: Thông báo từ server
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID của người dùng
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email của người dùng
 *                 fullName:
 *                   type: string
 *                   description: Tên đầy đủ của người dùng
 *                 profilePicture:
 *                   type: string
 *                   description: URL ảnh đại diện
 *                 thumbnail:
 *                   type: string
 *                   description: URL ảnh bìa
 *             accessToken:
 *               type: string
 *               description: JWT access token
 *             refreshToken:
 *               type: string
 *               description: JWT refresh token
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 *         - fullName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email đăng ký của người dùng
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu của người dùng
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Nhập lại mật khẩu
 *         fullName:
 *           type: string
 *           description: Tên đầy đủ của người dùng
 *       example:
 *         email: newuser@example.com
 *         password: Password123
 *         confirmPassword: Password123
 *         fullName: Nguyen Van A
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Trạng thái đăng ký
 *         message:
 *           type: string
 *           description: Thông báo từ server
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ID của người dùng
 *             email:
 *               type: string
 *               format: email
 *               description: Email của người dùng
 *             fullName:
 *               type: string
 *               description: Tên đầy đủ của người dùng
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email để khôi phục mật khẩu
 *       example:
 *         email: user@example.com
 *
 *     VerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email đã đăng ký
 *         otp:
 *           type: string
 *           description: Mã OTP để xác thực
 *       example:
 *         email: user@example.com
 *         otp: "123456"
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - password
 *         - confirmPassword
 *         - resetToken
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu mới
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Nhập lại mật khẩu mới
 *         resetToken:
 *           type: string
 *           description: Token để đặt lại mật khẩu
 *       example:
 *         password: NewPassword123
 *         confirmPassword: NewPassword123
 *         resetToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Luôn là false khi có lỗi
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Mã lỗi
 *             message:
 *               type: string
 *               description: Thông báo lỗi
 *         path:
 *           type: string
 *           description: Đường dẫn API gặp lỗi
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Thời điểm xảy ra lỗi
 */ 