/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu bằng token đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmNewPassword
 *               - resetPasswordToken
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: Mật khẩu mới
 *                 example: "NewPassword123!"
 *               confirmNewPassword:
 *                 type: string
 *                 description: Xác nhận mật khẩu mới
 *                 example: "NewPassword123!"
 *               resetPasswordToken:
 *                 type: string
 *                 description: Token JWT để xác thực yêu cầu
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo đổi mật khẩu thành công
 *                   example: "Password reset successfully"
 *       400:
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   description: Thời gian xảy ra lỗi
 *                   example: "2024-12-26T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   description: Đường dẫn API
 *                   example: "/auth/change-password"
 *                 code:
 *                   type: string
 *                   description: Mã lỗi
 *                   example: "VALIDATION_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Chi tiết lỗi
 *                       example: "New password and confirm password must match"
 *       403:
 *         description: Token không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   example: "2024-12-26T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   example: "/auth/change-password"
 *                 code:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Expired or invalid token"
 *       404:
 *         description: Không tìm thấy email
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
 *                       example: "Email not found"
 *       500:
 *         description: Lỗi từ server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   example: "2024-12-26T12:00:00.000Z"
 *                 path:
 *                   type: string
 *                   example: "/auth/change-password"
 *                 code:
 *                   type: string
 *                   example: "ERR_CHANGE_PASSWORD_FAILED"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Internal server error"
 */
