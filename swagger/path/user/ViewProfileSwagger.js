/**
 * @swagger
 * /user/profile/{id}:
 *   get:
 *     summary: Lấy thông tin hồ sơ người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của người dùng
 *         schema:
 *           type: string
 *           example: "64f2b7e89e1a7a001c9f0bfa"
 *     responses:
 *       200:
 *         description: Lấy thông tin hồ sơ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian trả về dữ liệu
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API được gọi
 *                   example: "/user/profile/{id}"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID của người dùng
 *                       example: "64f2b7e89e1a7a001c9f0bfa"
 *                     fullName:
 *                       type: string
 *                       description: Họ và tên của người dùng
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       description: Địa chỉ email của người dùng
 *                       example: "johndoe@example.com"
 *                     profilePicture:
 *                       type: string
 *                       description: URL ảnh đại diện của người dùng
 *                       example: "https://example.com/profile.jpg"
 *                     thumbnail:
 *                       type: string
 *                       description: URL ảnh thu nhỏ của người dùng
 *                       example: "https://example.com/thumbnail.jpg"
 *                     birthday:
 *                       type: string
 *                       description: Ngày sinh của người dùng (định dạng YYYY-MM-DD)
 *                       example: "1990-01-01"
 *                     bio:
 *                       type: string
 *                       description: Tiểu sử của người dùng
 *                       example: "Software Engineer from California."
 *                     gender:
 *                       type: string
 *                       description: Giới tính của người dùng
 *                       enum: [male, female, other]
 *                       example: "male"
 *                     createdAt:
 *                       type: string
 *                       description: Thời gian tạo tài khoản
 *                       example: "2023-01-01T10:10:10.000Z"
 *                     updatedAt:
 *                       type: string
 *                       description: Thời gian cập nhật tài khoản gần nhất
 *                       example: "2024-01-01T10:10:10.000Z"
 *       400:
 *         description: ID không hợp lệ hoặc thiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/user/profile/{id}"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "VALIDATION_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "ID không hợp lệ"
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/user/profile/{id}"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "DATA_NOT_FOUND"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
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
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-12-30T10:10:10.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/user/profile/{id}"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "ERR_RETRIEVE_PROFILE_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "Lỗi không xác định từ server"
 */
