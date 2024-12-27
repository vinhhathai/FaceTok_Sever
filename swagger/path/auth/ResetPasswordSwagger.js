/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Gửi email để đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Địa chỉ email của người dùng
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       201:
 *         description: Đã gửi liên kết đặt lại mật khẩu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo liên kết đặt lại mật khẩu đã được gửi
 *                   example: "Reset password link has been sent to johndoe@example.com."
 *       400:
 *         description: Yêu cầu không hợp lệ (email không hợp lệ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-11-23T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API gây lỗi
 *                   example: "/auth/reset-password"
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
 *                       example: "Email không đúng định dạng"
 *       403:
 *         description: Tài khoản bị khóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "ACCOUNT_IS_BANNED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Tài khoản đã bị khóa."
 *       404:
 *         description: Email không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "EMAIL_NOT_FOUND"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Email không tồn tại."
 *       500:
 *         description: Lỗi từ server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "ERR_GET_RESET_PASSWORD_LINK_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Lỗi không xác định từ server."
 */
