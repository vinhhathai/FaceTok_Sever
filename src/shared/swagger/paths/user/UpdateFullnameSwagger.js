"use strict";
//----------------------------------------------------------------

/**
 * @swagger
 * /user/update-fullname:
 *   put:
 *     summary: Cập nhật họ tên của người dùng
 *     description: Cập nhật họ tên của người dùng (chỉ được cập nhật 1 lần/60 phút)
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
 *               - fullName
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *                 description: Họ tên mới của người dùng (3-50 ký tự)
 *     responses:
 *       200:
 *         description: Cập nhật họ tên thành công
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
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                     lastNameUpdateTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T10:30:00.000Z"
 *                     nextNameUpdateAvailable:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-15T11:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Cập nhật họ tên thành công"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ hoặc chưa đủ thời gian cập nhật lại
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
 *                       example: "NAME_UPDATE_TIME_LIMIT"
 *                     message:
 *                       type: string
 *                       example: "Bạn cần đợi thêm 45 phút nữa để đổi tên"
 *                     detail:
 *                       type: object
 *                       properties:
 *                         timeRemaining:
 *                           type: number
 *                           example: 45
 *                 path:
 *                   type: string
 *                   example: "/user/update-fullname"
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
  description: "Cập nhật họ tên người dùng",
  path: "/user/update-fullname",
}; 