/**
 * @swagger
 * /user/update-profile/{id}:
 *   put:
 *     summary: Cập nhật thông tin hồ sơ người dùng
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Họ và tên của người dùng
 *                 example: "John Doe"
 *               bio:
 *                 type: string
 *                 description: Tiểu sử của người dùng
 *                 example: "Software Engineer from California."
 *               gender:
 *                 type: string
 *                 description: Giới tính của người dùng
 *                 enum: [male, female, other]
 *                 example: "male"
 *     responses:
 *       200:
 *         description: Cập nhật hồ sơ thành công
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
 *                   example: "/user/update-profile/{id}"
 *                 message:
 *                   type: string
 *                   description: Nội dung thông báo thành công
 *                   example: "Profile updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID của người dùng
 *                       example: "64f2b7e89e1a7a001c9f0bfa"
 *                     fullName:
 *                       type: string
 *                       description: Họ và tên đã được cập nhật
 *                       example: "John Doe"
 *                     bio:
 *                       type: string
 *                       description: Tiểu sử đã được cập nhật
 *                       example: "Software Engineer from California."
 *                     gender:
 *                       type: string
 *                       description: Giới tính đã được cập nhật
 *                       example: "male"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc thiếu
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
 *                   example: "/user/update-profile/{id}"
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
 *                       example: "Invalid input data."
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
 *                   example: "/user/update-profile/{id}"
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
 *                   example: "/user/update-profile/{id}"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "ERR_UPDATE_PROFILE_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nội dung lỗi
 *                       example: "An unexpected server error occurred."
 */
