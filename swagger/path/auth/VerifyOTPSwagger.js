/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Xác minh OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: Địa chỉ email của người dùng
 *                 format: email
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 description: Mã OTP nhận được qua email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP được xác minh thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo OTP hợp lệ
 *                   example: "OTP verified successfully"
 *                 resetToken:
 *                   type: string
 *                   description: Token được tạo để sử dụng khi đặt lại mật khẩu
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "INVALID_OTP"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Thông báo lỗi
 *                       example: "Invalid OTP"
 *       404:
 *         description: Không tìm thấy email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "EMAIL_NOT_FOUND"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Thông báo lỗi
 *                       example: "Email không tồn tại."
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "INTERNAL_SERVER_ERROR"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Thông báo lỗi
 *                       example: "Lỗi không xác định từ server."
 */
