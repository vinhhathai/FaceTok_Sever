"use strict";
//----------------------------------------------------------------

/**
 * @swagger
 * /user/update-profile:
 *   put:
 *     summary: Cập nhật thông tin cá nhân của người dùng
 *     description: Cập nhật các thông tin như bio, giới tính, vị trí, ngày sinh của người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Đây là thông tin giới thiệu bản thân"
 *                 description: Thông tin giới thiệu bản thân
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *                 description: Họ tên đầy đủ
 *               gender:
 *                 type: string
 *                 enum: [male, female, undefined]
 *                 example: "male"
 *                 description: Giới tính
 *               location:
 *                 type: string
 *                 example: "Hà Nội, Việt Nam"
 *                 description: Vị trí hiện tại
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *                 description: Ngày sinh (định dạng YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Cập nhật thông tin cá nhân thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     fullName:
 *                       type: string
 *                       example: "Nguyễn Văn A"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1637132723/avatars/user123.jpg"
 *                     thumbnail:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1637132723/thumbnails/user123.jpg"
 *                     birthday:
 *                       type: string
 *                       example: "1990-01-01"
 *                     bio:
 *                       type: string
 *                       example: "Đây là thông tin giới thiệu bản thân"
 *                     gender:
 *                       type: string
 *                       example: "male"
 *                     location:
 *                       type: string
 *                       example: "Hà Nội, Việt Nam"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thông tin cá nhân thành công"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_FAILED"
 *                     message:
 *                       type: string
 *                       example: "Dữ liệu không hợp lệ"
 *                 path:
 *                   type: string
 *                   example: "/user/update-profile"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-11-15T10:30:00.000Z"
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */

module.exports = {
  tags: ["User"],
  description: "Cập nhật thông tin cá nhân của người dùng",
  path: "/user/update-profile",
}; 