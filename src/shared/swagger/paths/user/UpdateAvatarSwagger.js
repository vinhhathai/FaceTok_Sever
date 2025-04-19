"use strict";
//----------------------------------------------------------------

/**
 * @swagger
 * /user/update-avatar-url:
 *   put:
 *     summary: Cập nhật avatar URL của người dùng
 *     description: Cập nhật URL avatar của người dùng đã được upload lên Cloudinary
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarUrl
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/example/image/upload/v1637132723/avatars/user123.jpg"
 *                 description: URL của avatar đã được upload lên Cloudinary
 *     responses:
 *       200:
 *         description: Cập nhật avatar thành công
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
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1637132723/avatars/user123.jpg"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Cập nhật avatar thành công"
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
 *                       example: "URL avatar không được để trống"
 *                 path:
 *                   type: string
 *                   example: "/user/update-avatar-url"
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
  description: "Cập nhật avatar URL người dùng",
  path: "/user/update-avatar-url",
}; 