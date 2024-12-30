/**
 * @swagger
 * /user/update-avatar/{user_id}:
 *   put:
 *     summary: Cập nhật ảnh đại diện người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         description: ID của người dùng cần cập nhật ảnh đại diện
 *         schema:
 *           type: string
 *           example: "60f74e50d5f8b8a64db40f00"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện mới của người dùng
 *     responses:
 *       200:
 *         description: Cập nhật ảnh đại diện thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật ảnh đại diện thành công"
 *                 avatarUrl:
 *                   type: string
 *                   example: "http://localhost:3000/upload/1618478329140-123456789.jpg"
 *       400:
 *         description: Yêu cầu không hợp lệ, ví dụ như thiếu ID người dùng hoặc ảnh đại diện
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   example: "/user/update-avatar/60f74e50d5f8b8a64db40f00"
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Ảnh đại diện là bắt buộc"
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   example: "/user/update-avatar/60f74e50d5f8b8a64db40f00"
 *                 code:
 *                   type: string
 *                   example: "DATA_NOT_FOUND"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "USER_NOT_FOUND"
 *       500:
 *         description: Lỗi từ server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   example: "/user/update-avatar/60f74e50d5f8b8a64db40f00"
 *                 code:
 *                   type: string
 *                   example: "ERR_UPDATE_AVATAR_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Lỗi không xác định từ server"
 */
